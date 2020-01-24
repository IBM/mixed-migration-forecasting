from model.displacement.model import Trainer
import json
import logging
from pprint import pprint

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(name)-12s %(levelname)-8s %(message)s')
logger = logging.getLogger(__name__)

baseyear = 2019
countries = ['AFG', 'MMR']

CONFIGURATION = 'configuration.json'

with open(CONFIGURATION, 'rt') as infile:
    config = json.load(infile)

if __name__ == "__main__":


    tr = Trainer(config, baseyear)
    tr.train()
    pprint(tr.score('AFG'))