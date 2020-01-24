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

from . import *
from .features import Generator

logger = logging.getLogger(__name__)


class Trainer(object):

    def __init__(self, config, baseyear):
        """ Needs a configuration object and base year """

        self.config = config
        self.baseyear = baseyear
        self.generator = Generator(config, baseyear)

    def score(self, countries=COUNTRIES):
        """ Scoring loop to generate forecasts """
        
        if not hasattr(self, 'models'):
            logger.warning("Models have not been trained. Training.")
            self.train()

        if isinstance(countries, str):
            countries = [countries]

        result = []

        for c in countries:

            F = self.generator.features(c, self.baseyear)
            _, _, Xv = F['data']

            for lg in LAGS:
                
                key = (c, lg)
                M = {'country': c}
                clf = self.models[key]['CLF']
                fc = clf.predict(Xv)
                M['year'] = self.baseyear + lg
                M['forecast'] = fc[0]
                M['CI_low'] = fc[0] - CI_LOOKUP[key]['lower']
                M['CI_high'] = fc[0] + CI_LOOKUP[key]['upper']
        
                result.append(M)

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
