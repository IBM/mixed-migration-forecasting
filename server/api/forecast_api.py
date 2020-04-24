from flask import (Flask, render_template, jsonify,
                   request, redirect, url_for, session, make_response)

from model.displacement.model import Trainer

import json
import os
import pandas as pd
import logging

logger = logging.getLogger(__name__)


def set_up(app, config):
    """
    Set up the prediction api's with

    :param app: a flask app to register the end point on
    :param config: application configuration object

    :returns: None

    """

    # Train the models
    logger.info("Training the models.")
    tr = Trainer(config)
    tr.train()

    COUNTRIES = config['supported-countries']['displacement']

    # get the clustering
    with open(config['GROUPING'], 'rt') as infile:
        groupings = json.load(infile)
    THEMES = [t['theme'] for t in groupings['clusters']]
    LABELS = {t['theme']: t['labels'] for t in groupings['clusters']}

    @app.route("/predict", methods=['get'])
    def forecast():  # pylint: disable=W0612

        # get required query parameters
        source = request.args.get('source')

        if source is None:
            return make_response(jsonify({"status": "error",
                                          "msg": "Invalid call. Source country missing."}), 405)

        if not source in COUNTRIES:
            return make_response(jsonify({"status": "error",
                                          "msg": "Invalid call. Source country: {} not supported.".format(source)}), 405)

        # Fetch the optional scenario
        scenario = {}
        for t in THEMES:
            k = request.args.get(t)
            if k is not None:
                if k not in LABELS[t]:
                    return make_response(jsonify({"msg":
                                                  "Invalid call. Unsupported change {} for theme {}. Supported changes: {}".format(k, t, ",".join(LABELS[t]))}), 405)
                scenario[t] = k

        if scenario:
            sc = tuple((k, scenario[k]) for k in sorted(scenario.keys()))
            logger.info("Scenario forecast query: Source: {}, base year: {} Scenario: {}".format(
                source, config['BASEYEAR'], scenario))
            result = tr.score(source, sc)
        else:
            logger.info(
                "Predicting for country {} for current/base year {}.".format(source, config['BASEYEAR']))

            result = tr.score(source)

        logger.info(result)
        return jsonify(result), 200
        