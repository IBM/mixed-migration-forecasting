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


def set_up(app, config):
    
    df = fetch_data(config)

    COUNTRIES = config["supported-countries"]['displacement']

    @app.route("/countries")
    def countries():
        """ Get the list of countries supported """

        # all countries names/codes in the data
        grp = (df
                .groupby(['Country Name', 'Country Code'])['year']
                .count()
                .reset_index()
                .drop(columns='year'))
        idx = grp['Country Code'].isin(COUNTRIES)

        return grp[idx].to_json(orient='records'), 200

    @app.route("/indicators")
    def indicators():

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
        response = df.loc[(df["Indicator Name"] == indicatorName)]["Indicator Code"].unique()[0]
        return jsonify(response), 200

    @app.route("/uniqueIndicators")
    def uniqueIndicators():

        indicators = df["Indicator Code"].unique()
        responce = [*indicators]
        return jsonify(responce), 200

    @app.route("/uniqueIndicatorNames")
    def uniqueIndicatorNames():

        indicators = df["Indicator Name"].unique()
        responce = [*indicators]
        return jsonify(responce), 200