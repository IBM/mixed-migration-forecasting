from sklearn.externals import joblib
import numpy as np
import pandas as pd
import logging
import os
import shap
from time import time

from .features import Generator

logger = logging.getLogger(__name__)


class Scorer(object):
    """
    A thin scoring wrapper around the underlying forecasting models.
    """

    def __init__(self, modelfile, config, baseyear):
        """
        The API requires artifacts:

        modelfile: serialized pre-trained models for prediction
        config : configuration object (dict) describing the indicators used
        groupings: cluster of indicator groups
        baseyear: the "current" year (forecast year = base year + 1)
        """

        # Load the persisted set of models
        logger.info("Loading persisted models.")
        self.model = joblib.load(modelfile)



        # Handle the feature generation portions
        logger.info("Generating features for models for base year {}.".format(baseyear))
        self.features = Generator(config, baseyear)

        # Assemble the base scoring feature set
       # for m in self.model:
          #  m['feature'] = self.features.fetch( baseyear)
            # joblib.dump(m['feature'], "{}-C2.joblib".format(m['target']))

        # Set up the explainers for point forecast SHAP values
        # logger.info("Setting up the explainers")
        # for m in self.model:
        # Use the estimator part of the pipeline only
        #    m['explainer'] = shap.TreeExplainer(m['clf'].named_steps['Estimator'])

        logger.info("Done initializing the forecasting API.")

        # Persist the model + feature set
        # joblib.dump(self.model, "test-models.joblib")

    @staticmethod
    def __get_explanations(explainer, Xv, fields):
        """
        Return the top 10 negative/positive fields, along with magnitude that
        impact a point forecast.

        Inputs:
        - a shap Explainer object
        - the features to be forecast
        - field names for the data

        Returns:
        - a dictionary with {field: shap value}
        """

        shap_values = explainer.shap_values(Xv)[0].tolist()

        impact = [(k, v) for k, v in zip(fields, shap_values)]

        pos = sorted(impact, key=lambda x: x[1])[:10]
        neg = sorted(impact, key=lambda x: x[1], reverse=True)[:10]

        return {k: v for k, v in pos+neg}

    def __adjust_features(self, Xv, scenario, year):
        """
        Adjust scenarios for scoring.

        Xv - an input dataframe for which the prediction is required.
        scenario - dictionary of indicator, adjustment fractions

        returns a modified dataframe

        raises ValueError
        """
#        Xv = Xv.loc[Xv['year']<year]

        if scenario is None:
            # Return base values as-is.
            return Xv

        for k in scenario.keys():
            if not self.features.indicator_exists(k):
                raise ValueError("Indicator code {} does not exist.".format(k))

        # Sliders are absolute
        aXv = Xv.copy(deep=True)
        changes = {}
        for k, v in scenario.items():

            old = aXv[k].values[0]
            # update
            aXv[k] = v  # absolute
            # aXv[k] = aXv[k] * v # relative
            changes[k] = (old, v)

        logger.debug("Scenario changes: {}".format(changes))

        return aXv

    def __current_state(self, country='ETH', year=2017):
        """ Get the current values/labels for indicator set """
        values = [self.features.indicator_value(i, country, year) for i in indicators]
        return {i: (v, pred_api.features.value_to_category(i, v)) for (i, v) in zip(indicators, values)}

    def predict(self, forecastyear, country, scenario=None):
        """
        Generate a prediction set for all available targets for forecast year.
        Optionally specific a scenario (dictionary of indicator/value pairs)
        """

        start_time = time()

        results = []
        R = {}
        for m in self.model:
            if m['country']!=country:
                continue

            # "TARGET" -> ISO-3 country code of destination country

            R['target'] = m['target']

            # Forecast year in the input query
            R['year'] = forecastyear

            # Scenario in the input query
            R['scenario'] = scenario if scenario else {}

           # Xv = self.__adjust_features(m['feature'], scenario, forecastyear)
            Xv = self.features.fetch( int(forecastyear), country)
            #print(Xv.head())
            # logger.info("Return adjust features in {:3.2f} sec.".format(time() - start_time))

            R['forecast'] = m['clf'].predict(Xv)[0]
            # logger.info("Return forecast predict in {:3.2f} sec.".format(time() - start_time))

            # Explanation of point forecast using SHAP values
            # R['explanation'] = self.__get_explanations(m['explainer'], Xv, m['Xt'].columns)

            # Confidence intervals are now one-sided
            # R['CI'] = [0.0, m['CI'].predict(Xv)[0]]
            # logger.info("Return CI predict in {:3.2f} sec.".format(time() - start_time))

        results.append(R)

        logger.debug("Return predict in {:3.2f} sec.".format(time() - start_time))

        return results
