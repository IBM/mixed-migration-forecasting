"""
Evaluate the model.

"""

import numpy as np
import json
import pickle
import os
from model import trainer
from itertools import product


from model.displacement import TARGETS, LAGS
from model.displacement.model import Trainer
from model.displacement.features import Generator

PERIODS = [{'train_years': (1995, Y - lg), 
            'predict_year': Y,
            'lag': lg} for Y in np.arange(2010, 2016, 1) for lg in LAGS]

# Get instance
CONFIGURATION = "configuration.json"

# Configuration of data sources
with open(CONFIGURATION, 'rt') as infile:
    config = json.load(infile)

COUNTRIES = config['supported-countries']['displacement']

def run():

    results = []

    for c, p in product(COUNTRIES, PERIODS):

        # Generate the problem (training) instance


        # Generate the scoring instance


        # Measure error


with open("result.pkl", 'wb') as outfile:
    pickle.dump(results, outfile)
