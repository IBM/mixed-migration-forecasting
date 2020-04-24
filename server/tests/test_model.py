
import json
import logging
from pprint import pprint
import numpy as np
import pytest
from itertools import product

import seaborn as sns
import matplotlib.pyplot as plt

import sys, os
sys.path.insert(0, os.path.join(os.getcwd()))

from model.displacement.model import Trainer

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(name)-12s %(levelname)-8s %(message)s')
logger = logging.getLogger(__name__)
logging.getLogger("matplotlib").setLevel(logging.WARNING)


CONFIGURATION = 'configuration.json'
GROUPINGS = 'groupings.json'

config = json.load(open(CONFIGURATION, 'rt'))
groupings = json.load(open(GROUPINGS, 'rt'))

COUNTRIES = config['supported-countries']['displacement']

def plot_result(tr, pred):

    df = tr.generator.data
    c1 = df['Country Code'] == pred[0]['country']
    y = df.loc[c1, 'DRC.TOT.DISP']
    x = df.loc[c1, 'year']

    plt.figure()
    plt.plot(x, y, '-b.', markersize=10, label='observation')

    pred_x = [a['year'] for a in pred[0]['prediction']]
    pred_y = [a['forecast'] for a in pred[0]['prediction']]
    ci_low = [a['CI_low'] for a in pred[0]['prediction']]
    ci_high = [a['CI_high'] for a in pred[0]['prediction']]

    plt.plot(pred_x, pred_y, 'rs', label=u'Forecast')
    plt.fill(np.concatenate([pred_x, pred_x[::-1]]),
         np.concatenate([ci_high, ci_low[::-1]]),
         alpha=.5, fc='g', ec='None', label='95% interval')
    plt.legend(loc=0)

    plt.xlim([1995, config['BASEYEAR']])
    plt.xticks(np.arange(1995, config['BASEYEAR'] + 8, 1))
    plt.title(pred[0]['country'])

@pytest.fixture
def trainer():
    tr = Trainer(config)
    tr.train()
    return tr

def test_prediction(trainer):
    """ Base prediction - no scenario """

    for c in COUNTRIES:
        pred = trainer.score(c)

def test_scenario(trainer):
    """ What-if scenarios """

    featureset = [i['code']
                           for c in groupings['clusters'] for i in c['indicators']]
    THEMES = [c['theme'] for c in groupings['clusters']]
    LABELS = {t['theme']: t['labels'] for t in groupings['clusters']}

    for c in COUNTRIES:
        for t in THEMES:
            for lbl in LABELS[t]:
                user_scenario = ((t, lbl),)
                trainer.score(c, user_scenario)


if __name__ == "__main__":
    #test_prediction(Trainer(config))
    test_scenario(Trainer(config))