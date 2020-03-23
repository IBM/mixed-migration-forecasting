"""
Trainer class to train all models.

For each country, we build a model for each year that we forecast.

"""

import joblib
import numpy as np
import pandas as pd
import logging
import os
import json
from time import time
from itertools import product
from functools import lru_cache

from sklearn.base import clone

from . import *
from .features import Generator
from .scenarios import Scenario

logger = logging.getLogger(__name__)


class Trainer(object):

    def __init__(self, config):
        """ Needs a configuration object and base year """

        self.config = config
        self.baseyear = config['BASEYEAR']
        self.COUNTRIES = config['supported-countries']['displacement']
        self.generator = Generator(config)
        self.scenarios = Scenario(self.generator.data, config)

        # get the grid search parameter results
        gs_params = json.load(open(config['gridsearch-parameters'], 'rt'))
        self.parameters = {}
        for k in gs_params:
            self.parameters[(k['country'], k['lag'])] = k['params']

    def get_parameters(self, country, lag):
        """ Returns grid search parameters from look up """

        key = country, lag
        if key in self.parameters.keys():
            return self.parameters[key]

        else:
            logger.debug("Using default model parameters ({}, {}).".format(country, lag))
            return {"Estimator__loss": "ls", 
                "Estimator__n_estimators": 500, 
                "Estimator__learning_rate": 0.01, 
                "Estimator__max_depth": 5}


    @lru_cache(maxsize=1024)
    def score(self, countries=None, scenario=None):
        """
        Scoring loop to generate forecasts
        countries: List or a string 
        scenario: a tuple of tuple (an immutable represention of a Dict so it can be cached)
        """
        if not countries:
            countries = self.COUNTRIES 

        if scenario:
            scenario = {k: v for (k, v) in scenario}

        if not hasattr(self, 'models'):
            logger.warning("Models have not been trained. Training.")
            self.train()

        if isinstance(countries, str):
            countries = [countries]

        result = []

        for c in countries:

            if scenario:

                # get the total scenario change
                F = self.generator.features(c, self.baseyear)
                _, _, Xv = F['data']
                
                deltaT = self.scenarios.compute_target_change(Xv, scenario, c)
                MC = {'country': c, 
                      'explanation': deltaT[(c, 0)]['significance']}

            # TODO: Add non-scenario model explanation statements.
            MC = {'country': c,
                 'explanation': "Here is a test explanation clause that will be updated."}
            
            pred = []

            for lg in LAGS:

                F = self.generator.features(c, self.baseyear + lg)
                _, _, Xv = F['data']

                D = self.generator.features(c, self.baseyear + lg, differencing=True)
                _, _, Xdv = D['data']
                curr_for = D['baseline']
                
                key = (c, lg)
                
                bm = self.models[key]['base']
                b_features = self.models[key]['bfeatures']

                Xv = Xv[b_features]
                fb = bm.predict(Xv)[0]

                # changes model predicts change in displacement.
                # for subsequent lag, update the displacement
                cm = self.models[key]['change']
                c_features = self.models[key]['cfeatures']
                Xdv = Xdv[c_features]
                
                fc = cm.predict(Xdv)[0] + curr_for
                curr_for = fc

                # ensemble
                # forecast = 0.5 * (fb + fc)
                forecast = fb
                
                if scenario:
                    # We assume year2 impacts persist across future years
                    sclag = max(SCENARIO_LAGS) if lg > max(SCENARIO_LAGS) else lg
                    forecast += deltaT[(c, sclag)]['change']

                fc = None
                logger.info("Forecasts {} (lag {}): base: {} change: {} ensemble:{}".format(c, lg, fb, fc, forecast))

                # Centre the range around the forecast
                try: 
                    ci_range = CI_LOOKUP[key]['upper'] - CI_LOOKUP[key]['lower']
                except KeyError:
                    logger.warn("Using confidence estimates from Afghanistan. Rerun CI bootstrap estimates for {}.".format(c))
                    k2 = ('AFG', lg)
                    ci_range = CI_LOOKUP[k2]['upper'] - CI_LOOKUP[k2]['lower']
                di = ci_range / 2.0

                M = {'year' :self.baseyear + lg, 
                     'forecast' : forecast, 
                     'scenario': scenario,
                     'CI_low':  forecast - di, 
                     'CI_high': forecast + di}
                
                pred.append(M)

            MC['prediction'] = pred
            MC['status'] = 'OK'
            result.append(MC)

        return result

    
    def train(self):
        """ Main training loop """

        logger.info("Training {} models for {} countries.".format(
            len(self.COUNTRIES) * len(LAGS), len(self.COUNTRIES)))

        start_time = time()
        self.models = {}

        for c, lg in product(self.COUNTRIES, LAGS):

            M = {'country': c, 'lag': lg, 'baseyear': self.baseyear}

            # Get training data for the base model
            F = self.generator.features(
                c, self.baseyear + lg, method='training')

            D = self.generator.features(
                c, self.baseyear + lg, method='training', differencing=True)

            Xt, yt, _ = F['data']

            # print(pd.isnull(Xt).sum().sort_values(ascending=False).head(10))

            base_model = clone(CLF)
            pset = self.get_parameters(c, lg)
            base_model.set_params(**pset)

            base_model.fit(Xt, yt)
            M['base'] = base_model
            M['bfeatures'] = F['features']

            
            Xdt, ydt, _ = D['data']
            change_model = clone(CLF)
            pset = self.get_parameters(None, None)
            change_model.set_params(**pset)
            change_model.fit(Xdt, ydt)
            M['change'] = change_model
            M['cfeatures'] = D['features']
            M['baseline'] = D['baseline']

            self.models[(c, lg)] = M

        logger.info("Done with {} models in {:3.2f} sec."
                    .format(len(LAGS) * len(self.COUNTRIES), time() - start_time))

    def load(self):
        """ load persisted models """

        if hasattr(self, 'models'):
            logger.info("Trained models replaced by persisted models.")
        
        try:
            self.models = joblib.load(self.config['MODELFILE']['displacement'])
        except FileNotFoundError:
            logger.error("Persisted models at {} not found".format(self.config['MODELFILE']['displacement']))


    def persist(self):
        """ store models to file """

        if not hasattr(self, 'models'):
            logger.info("Models hasn't been trained. Retraining.")
            self.train()

        joblib.dump(self.models, self.config['MODELFILE']['displacement'])
