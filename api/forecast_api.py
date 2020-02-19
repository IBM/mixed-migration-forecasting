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

    @app.route("/predict", methods=['get'])
    def forecast(): # pylint: disable=W0612

        # get required query parameters
        source = request.args.get('source')

        if source is None:
            return make_response(jsonify({"msg": "Invalid call. Source country missing."}), 405)

        logger.info("Predicting for country {} for current/base year {}.".format(source, config['BASEYEAR']))
        
        try:
            result = tr.score(source)
            logger.info(result)
            return jsonify(result), 200
        except AssertionError as e:
            result = {e}