"""
App endpoints for indicators/features. This handles "raw"
features only. 

Projections and other feature generators are implemented with
the model.
"""

import os
import json
import pandas as pd
from flask import jsonify, request
from time import time
import logging
import numpy as np

logger = logging.getLogger(__name__)


def fetch_data(config):
    """ Assemble the raw indicator sources """

    start_time = time()
    sources = [os.path.join(os.getcwd(), config['paths']['output'],
                            d['name'],
                            'data.csv') for d in config['sources']]

    # Generate a data frame with all indicators
    df = pd.concat((pd.read_csv(f)
                            for f in sources), sort=False, ignore_index=True)

    # Summary stats
    logger.info("Sources            : {}".format(len(sources)))
    logger.info("Row count          : {}".format(len(df)))
    logger.info("Geographies        : {}".format(len(df['Country Name'].unique())))
    logger.info("Indicators         : {}".format(len(df['Indicator Code'].unique())))
    logger.info("Temporal coverage  : {} -> {}".format(df.year.min(), df.year.max()))
    logger.info("Null values        : {}".format(sum(df['value'].isnull())))

    logger.info("Loaded data in {:3.2f} sec.".format(time() - start_time))

    return df


def indicator_summary(config):
    """
    Generate a summary of indicators, sources etc.
    """

    result = []
    for d in config['sources']:
        tmp = pd.read_csv(os.path.join(os.getcwd(), config['paths']['output'], 
                            d['name'], 
                            'data.csv'))
        
        sr = (tmp
            .groupby('Indicator Code')['year']
            .max()
            .reset_index()
            .rename(columns={'year': 'last updated'})
            .to_dict(orient='records'))
            
        # add the source/detail (from config)
        [s.update({'source': d['source'], 
                    'detail': d['detail']}) for s in sr]
    
        result += sr
    
    return result


def set_up(app, config):
    
    df = fetch_data(config)
    metadata = indicator_summary(config)

    COUNTRIES = config["supported-countries"]['displacement']

    # Setup some common lookups

    # all countries names/codes in the data
    country_codes = (df
            .groupby(['Country Name', 'Country Code'])['year']
            .count()
            .reset_index()
            .drop(columns='year'))

    # all indicators as a key-value store {code: description}
    grp = (df
            .groupby(['Indicator Code', 'Indicator Name'])['year']
            .count()
            .reset_index()
            .drop(columns='year')
            .set_index('Indicator Code').to_dict())
    INDICATORS = grp['Indicator Name']
    REV_INDICATORS = {v: k for k, v in INDICATORS.items()}

    @app.route("/countries")
    def countries():
        """ Get the list of countries supported """

        idx = country_codes['Country Code'].isin(COUNTRIES)
        return country_codes[idx].to_json(orient='records'), 200

    @app.route("/indicators")
    def indicators():
        """ 
        Returns all indicator related data for specfic query.

        Query is specified by the following parameters:
        country: comma separated ISO3 codes or 'all'
        indicator: indicator code or 'all' for data on all indicators
        years: a single year e.g. 1980 or a year range, eg. 1980-1990

        Returns a 
        """
        country = request.args.get('country')
        indicator = request.args.get('indicator')
        years = request.args.get('years')

        countries = country.split(',')

        if indicator == 'all':
            if country != 'all':
                sub_df = df.loc[df["Country Code"].isin(countries)]
        else:
            if country != 'all':
                sub_df = df.loc[(df["Country Code"].isin(countries)) & (df["Indicator Code"] == indicator)]
            else:
                sub_df = df.loc[df["Indicator Code"] == indicator]
            # print(indicators)

        if years:
            if len(years) == 4:
                sub_df = sub_df.loc[sub_df["year"] == int(years)]
            else:
                sub_df = sub_df.loc[sub_df["year"] >= int(years[:4])]
                sub_df = sub_df.loc[sub_df["year"] <= int(years[5:])]

        return sub_df.to_json(orient='records')

    @app.route("/latestIndicators")
    def latestIndicators():
        country = request.args.get('country')
        indicator = request.args.get('indicator')
        try:
            years = request.args.get('years')
            years = int(years)
        except:
            years = 1

        countries = country.split(',')

        if indicator == 'all':
            if country != 'all':
                sub_df = df.loc[df["Country Code"].isin(countries)]
        else:
            if country != 'all':
                sub_df = df.loc[(df["Country Code"].isin(countries)) & (df["Indicator Code"] == indicator)]
            else:
                sub_df = df.loc[df["Indicator Code"] == indicator]
            # print(indicators)

        result_df = pd.DataFrame(columns=df.columns)
        for ind in sub_df["Indicator Code"].unique():
            y = sub_df.loc[sub_df["Indicator Code"] == ind].groupby('Indicator Code')['year'].max().reset_index()[
                'year'].values[0]
            for i in range(0, years):
                ind_df = sub_df.loc[(sub_df["Indicator Code"] == ind) & (sub_df["year"] == int(y - i))]
                result_df = result_df.append(ind_df)

        return result_df.to_json(orient='records')

    def get_outliers(data, indicator):
        """ Get a set of dots with significant change in indicator values
                which can be considered outliers """
        sub_df = data.loc[data["Indicator Code"] == indicator]
        sub_df = sub_df.sort_values(by='year')

        significant = {}

        if len(sub_df['value'].values) > 0:

            diff_sum = 0
            stored = sub_df['value'].values[0]
            year_before = sub_df['year'].values[0]
            i = 0
            for index, row in sub_df.iterrows():
                v = row['value']
                y = row['year']
                dif = v - stored
                if y - year_before == 1:
                    diff_sum = diff_sum + np.abs(dif)
                stored = v
                year_before = y
                i += 1
            avg = diff_sum / i

            # avg = (max-min)/2

            stored = sub_df['value'].values[0]
            year_before = sub_df['year'].values[0]
            for i, row in sub_df.iterrows():
                v = row['value']
                y = row['year']
                dif = v - stored
                if y - year_before == 1:
                    if np.abs(dif) >= 2 * (avg):
                        significant[y] = v
                        # significant.append(significant_dot)
                stored = v
                year_before = y

        return significant

    @app.route("/outliers")
    def outliers():
        country = request.args.get('country')
        indicator = request.args.get('indicator')

        sub_df = df.loc[df["Country Code"] == country]

        outliers = get_outliers(sub_df, indicator)

        return jsonify(outliers), 200
    
    @app.route("/indicatorCodeByName")
    def indicatorCodeByName():
        indicatorName = request.args.get('indicator')
        try:
            response = REV_INDICATORS[indicatorName]
        except KeyError:
            response = "No indicator '{}' in the data.".format(indicatorName)
        
        return jsonify(response), 200

    @app.route("/uniqueIndicators")
    def uniqueIndicators():
        """ Returns set of indicator codes in the data """
        return jsonify(list(INDICATORS.keys())), 200

    @app.route("/uniqueIndicatorNames")
    def uniqueIndicatorNames():
        """ Set of indicator names in the data """
        return jsonify(list(INDICATORS.values())), 200

    @app.route("/indicatorMetadata")
    def indicatorMetadata():
        """ Return all indicator attributes: source/last updated etc. """
        return jsonify(metadata), 200
