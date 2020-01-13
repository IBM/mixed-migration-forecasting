from flask import (Flask, render_template, jsonify,
                   request, redirect, url_for, session, make_response)

from model.migration.prediction import Scorer
from model.migration.features import Generator

import json
import os
import pandas as pd
import logging

logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s %(name)-12s %(levelname)-8s %(message)s')
logger = logging.getLogger(__name__)

# User facing labels
LABELS = ['nan','worse', 'poor', 'average', 'good', 'best']


def set_up(app, baseyear, config):

    # Deal with variable groupings/clusters. These are used to
    # work with scenarios. Each scenario has a set of indicators
    # associated with it. 
    with open(config['GROUPINGS'], 'rt') as infile:
        GROUPING = json.load(infile)

    # Indicators that we use for scenarios and their relative improvements
    INDICATORS = {i['code']: i['direction-improvement'] 
                for grp in GROUPING['clusters'] for i in grp['indicators']}

    # Themes that are defined in the groupings
    THEMES = [t['sub-theme'] for t in GROUPING['clusters']]

    # Finally set up the prediction object.
    # TODO: train the model, if we don't want to ship persisted ones
    pred_api = Scorer(config['MODELFILE']['migration'], config, GROUPING, baseyear)

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
        # if forecastyear != '2018':
        #    return make_response(jsonify({"msg": "Only 2018 supported for this demonstrator."}), 405)
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
                tot = 0
                for ind in info:
                     tot  += LABELS.index(info[ind][1])
                curr_value[subtheme] = LABELS[round(tot / len(info))]

            for m in result:
                m['scenario'] = curr_value

        logger.info(result)

        return jsonify(result), 200