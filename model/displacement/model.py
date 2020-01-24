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

from . import *
from .features import Generator

logger = logging.getLogger(__name__)


class Trainer(object):

    def __init__(self, config, baseyear):
        """ Needs a configuration object and base year """

        self.config = config
        self.baseyear = baseyear
        self.generator = Generator(config, baseyear)

    @lru_cache(maxsize=1024)
    def score(self, countries=COUNTRIES, scenario=None):
        """ Scoring loop to generate forecasts """
        
        if not hasattr(self, 'models'):
            logger.warning("Models have not been trained. Training.")
            self.train()

        if isinstance(countries, str):
            countries = [countries]

        for c in countries:
            if c not in COUNTRIES: # Support list of countries for models
                return {'status': 'error', 
                        'msg': "Forecast not supported for country {}.".format(c)}

        result = []

        for c in countries:

            F = self.generator.features(c, self.baseyear)
            _, _, Xv = F['data']

            MC = {'country': c,
                 'explanation': "Here is a test explanation clause that will be updated."}
            pred = []
            for lg in LAGS:
                
                key = (c, lg)
                
                clf = self.models[key]['CLF']
                fc = clf.predict(Xv)
                M = {'year' :self.baseyear + lg, 
                     'forecast' : fc[0], 
                     'CI_low':  fc[0] - CI_LOOKUP[key]['lower'], 
                     'CI_high': fc[0] + CI_LOOKUP[key]['upper']}
                
                pred.append(M)

            MC['prediction'] = pred
            MC['status'] = 'OK'
            result.append(MC)

        return result

    
    def train(self):
        """ Main training loop """

        logger.info("Training {} models for {} countries.".format(
            len(LAGS), len(COUNTRIES)))

        start_time = time()
        self.models = {}

        for c, lg in product(COUNTRIES, LAGS):

            M = {'country': c, 'lag': lg, 'baseyear': self.baseyear}

            # Get training data for this
            F = self.generator.features(
                c, self.baseyear + lg, method='training')

            Xt, yt, _ = F['data']
            CLF.fit(Xt, yt)

            M['CLF'] = CLF

            self.models[(c, lg)] = M

        logger.info("Done with {} models in {:3.2f} sec."
                    .format(len(LAGS) * len(COUNTRIES), time() - start_time))

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
