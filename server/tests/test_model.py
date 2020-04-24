
import json
import logging
from pprint import pprint
import numpy as np
import pytest
from itertools import product

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