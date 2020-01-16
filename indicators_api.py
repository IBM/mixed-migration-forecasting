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
        tmp = pd.read_csv(os.path.join("..", config['paths']['output'], 
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
