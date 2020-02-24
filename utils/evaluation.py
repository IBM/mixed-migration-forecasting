# TODO: To be refactored/removed

import numpy as np
import json
import pickle
import os
from model import trainer
from model.prediction import Scorer

# Years to predict the variables for (all one-year ahead)
PERIODS = [{'train_years': (1995, Y-1),
            'predict_year': Y} for Y in np.arange(2011, 2018, 1)]

# Feature combinations to evaluate
FSETS = ['ETH', 'SSA',
         'ETH+AR', 'SSA+AR',
         'ETH+AR+DEST', 'SSA+AR+DEST',
         'ETH+AR+DEST+TLAG', 'SSA+AR+DEST+TLAG']

MODELFILE = os.path.join(os.path.dirname(__file__), "model", "models.joblib")
CONFIGURATION = os.path.join(os.path.dirname(__file__), "configuration.json")
CLUSTERS = os.path.join(os.path.dirname(__file__), "groupings.json")


# Configuration of data sources
with open(CONFIGURATION, 'rt') as infile:
    config = json.load(infile)

# Get the groups (for labels and inference)
with open(CLUSTERS, 'rt') as infile:
    GROUPING = json.load(infile)

# Indicators that we use for Scenarios and their relative improvements
INDICATORS = {i['code']: i['direction-improvement']
              for grp in GROUPING['clusters'] for i in grp['indicators']}

# Themes that are defined in the groupings
THEMES = [t['sub-theme'] for t in GROUPING['clusters']]

# User facing labels
LABELS = ['worse', 'poor', 'average', 'good', 'best']

TARGETS = [t['targets'] for t in trainer.TARGETS]

results = []
for p in PERIODS:

    # Update training parameters (period and feature sets)
    # and (re)train the models
    trainer.PERIODS = p
    trainer.MODELFILE = MODELFILE
    trainer.CONFIGURATION = CONFIGURATION
    trainer.execute()

    # Generate the forecasts (one year ahead)
    pred_api = Scorer(MODELFILE, config, GROUPING, p['predict_year'] - 1)
    predictions = pred_api.predict(p['predict_year'])
    pred = {v['target']: v['forecast'] for v in predictions}

    # Get the ground truth
    truth = {t: pred_api.features.indicator_value(t, "ETH", p['predict_year']) for t in TARGETS}

    # A naive baseline is the current year's value
    baseline = {t: pred_api.features.indicator_value(t, "ETH", p['predict_year'] - 1) for t in TARGETS}

    # Feature set used
    fset = {t['targets']: t['features'] for t in trainer.TARGETS}

    for t in TARGETS:
        res = {'predict_year': p['predict_year'],
               'target': t,
               'fset': fset[t],
               'forecast': pred[t],
               'truth': truth[t],
               'baseline': baseline[t]}

        results.append(res)

with open("result.pkl", 'wb') as outfile:
    pickle.dump(results, outfile)
