from flask import (Flask, render_template, jsonify,
                   request, redirect, url_for, session, make_response)

from model.prediction import Scorer
from model.features import Generator


from model_afg_mmr.prediction import Scorer as ScorerAM


import json
import os
import pandas as pd
import logging


logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s %(name)-12s %(levelname)-8s %(message)s')
logger = logging.getLogger(__name__)

MODELFILE = "model/models.joblib"
MODELFILEAM = "model_afg_mmr/models.joblib"
CONFIGURATION = "configuration.json"
CLUSTERS = "groupings.json"

# Get the groups (for labels and inference)
with open(CLUSTERS, 'rt') as infile:
    GROUPING = json.load(infile)

# Indicators that we use for Scenarios and their relative improvements
INDICATORS = {i['code']: i['direction-improvement'] for grp in GROUPING['clusters'] for i in grp['indicators']}

# Themes that are defined in the groupings
THEMES = [t['sub-theme'] for t in GROUPING['clusters']]

# User facing labels
LABELS = ['nan','worse', 'poor', 'average', 'good', 'best']




def set_up(app, baseyear):

    with open(CONFIGURATION, 'rt') as infile:
        config = json.load(infile)

    pred_api = Scorer(MODELFILE, config, GROUPING, baseyear)
    pred_api2 = ScorerAM(MODELFILEAM, config, baseyear)

    def current_state(indicators, country, year):
        """ Get the current values/labels for indicator set """
        values = [pred_api.features.indicator_value(i, country, year) for i in indicators]
        return {i: (v, pred_api.features.value_to_category(i, v)) for (i, v) in zip(indicators, values)}


    def future_state(scenario):
        """ Assign new values to indicator groups """

        result = {}
        for theme, lbl in scenario.items():

            # Get the set of indicators associated with this theme
            ind = [i['code'] for grp in GROUPING['clusters']
                   for i in grp['indicators'] if grp['sub-theme'] == theme]

            # Get the numeric value associated with the label lbl
            result.update({i: pred_api.features.category_to_value(i, lbl) for i in ind})

        return result

    @app.route("/predict", methods=['get'])
    def forecast():

        #if 'username' not in session:
        #    return redirect(url_for('login'))

        # get required query parameters
        forecastyear = request.args.get('year')
        source = request.args.get('source')

        if forecastyear is None:
            return make_response(jsonify({"msg": "Invalid call. Forecast year missing."}), 405)
        if forecastyear != '2018':
            return make_response(jsonify({"msg": "Only 2018 supported for this demonstrator."}), 405)
        if source is None:
            return make_response(jsonify({"msg": "Invalid call. Source country missing."}), 405)

        if source != 'ETH':
            return make_response(jsonify({"msg":
                                          "Invalid call. Only Ethiopia (ETH) supported for source country."}), 405)

        # Get the (optional) scenario inputs
        scenario = {}
        for t in THEMES:
            k = request.args.get(t)
            if k is not None:
                if k not in LABELS:
                    return make_response(jsonify({"msg":
                                                  "Invalid call. Unknown class {} for type {}.".format(k, t)}), 405)

                scenario[t] = k

        if scenario:
            logger.info("Scenario forecast query: Year: {}, Source: {}, Scenario: {}".format(forecastyear,
                                                                                             source,
                                                                                             scenario))

            # Translate scenario labels to values
            numeric_scenario = future_state(scenario)

            # Score the model
            result = pred_api.predict(forecastyear=forecastyear, scenario=numeric_scenario)

        else:
            logger.info("Forecast query: Year: {}, Source: {}".format(forecastyear, source))
            result = pred_api.predict(forecastyear=forecastyear)

            # Get the current values/categories for each indicator
            curr_scenario = {}
            for grp in GROUPING['clusters']:
                ind = [i['code'] for i in grp['indicators']]
                curr_scenario[grp['sub-theme']] = current_state(ind, 'ETH', baseyear)

            curr_value = {}
            for subtheme, info in curr_scenario.items():
                tot = 0;
                for ind in info:
                     tot  += LABELS.index(info[ind][1])
                curr_value[subtheme] = LABELS[round(tot / len(info))]


            for m in result:
                m['scenario'] = curr_value

        logger.info(result)

        return jsonify(result), 200

    @app.route("/countries")
    def countries():
        countries = []
        afg = {}
        afg["Country Name"]="Afghanistan"
        afg["Country Code"]="AFG"
        countries.append(afg)
        mmr={}
        mmr["Country Name"]="Myanmar"
        mmr["Country Code"]="MMR"
        countries.append(mmr)
        return jsonify(countries), 200

    @app.route("/indicators")
    def indicators():
        country = request.args.get('country')
        indicator = request.args.get('indicator')
        years = request.args.get('years')

        countries = country.split(',')

        df = pred_api2.features.df_raw

        # with open("configuration.json", 'rt') as infile:
        #     config = json.load(infile)
        # sources = [os.path.join(config['paths']['output'],
        #                         d['name'],
        #                         'data.csv') for d in config['sources']]

        # for ds in sources:
        # df = pd.read_csv(ds)
        if indicator == 'all':
            if country != 'all':
                df = df.loc[df["Country Code"].isin(countries)]
        else:
            if country != 'all':
                df = df.loc[(df["Country Code"].isin(countries)) & (df["Indicator Code"] == indicator)]
            else:
                df = df.loc[df["Indicator Code"] == indicator]
            # print(indicators)

        if years:
            if len(years) == 4:
                df = df.loc[df["year"] == int(years)]
            else:
                df = df.loc[df["year"] >= int(years[:4])]
                df = df.loc[df["year"] <= int(years[5:])]

        return df.to_json(orient='records')



    @app.route("/predictam", methods=['get'])
    def forecast2():

        # if 'username' not in session:
        #    return redirect(url_for('login'))

        # get required query parameters
        forecastyear = request.args.get('year')
        country = request.args.get('country')

        if forecastyear is None:
            return make_response(jsonify({"msg": "Invalid call. Forecast year missing."}), 405)



        # Get the (optional) scenario inputs
        scenario = {}

        result = pred_api2.predict(forecastyear=forecastyear, country=country)

            # Get the current values/categories for each indicator
        curr_scenario = {}


        curr_value = {}
        for subtheme, info in curr_scenario.items():
            tot = 0;
            for ind in info:
                tot += LABELS.index(info[ind][1])
            curr_value[subtheme] = LABELS[round(tot / len(info))]

        for m in result:
            m['scenario'] = curr_value

        logger.info(result)

        return jsonify(result), 200

    @app.route("/indicatorCodeByName")
    def indicatorCodeByName():
        indicatorName = request.args.get('indicator')
        responce = pred_api2.features.df_raw.loc[(pred_api2.features.df_raw["Indicator Name"] == indicatorName)]["Indicator Code"].unique()[0]
        return jsonify(responce), 200

    @app.route("/uniqueIndicators")
    def uniqueIndicators():

        indicators = pred_api2.features.df_raw["Indicator Code"].unique()
        responce = [*indicators]
        return jsonify(responce), 200

    @app.route("/uniqueIndicatorNames")
    def uniqueIndicatorNames():

        indicators = pred_api2.features.df_raw["Indicator Name"].unique()
        responce = [*indicators]
        return jsonify(responce), 200