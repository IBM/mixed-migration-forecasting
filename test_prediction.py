import pickle
from collections import Counter
import json
import pandas as pd
import logging
from model.prediction import Scorer

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(name)-12s %(levelname)-8s %(message)s')
logger = logging.getLogger(__name__)

MODELFILE = "model/models-scenario.joblib"
CONFIGURATION = "configuration.json"
CLUSTERS = "groupings.json"

# Get the groups (for labels and inference)
with open(CLUSTERS, 'rt') as infile:
    GROUPING = json.load(infile)

# Indicators that we use for Scenarios and their relative improvements
INDICATORS = {i['code']: i['direction-improvement'] for grp in GROUPING['clusters'] for i in grp['indicators']}

# Themes that are defined in the groupings
THEMES = [t['sub-theme'] for t in GROUPING['clusters']]

# User facing labels
LABELS = ['worse', 'poor', 'average', 'good', 'best']


def current_state(pred_api, indicators, country='ETH', year=2017):
    """ Get the current values/labels for indicator set """
    values = [pred_api.features.indicator_value(i, country, year) for i in indicators]
    return {i: (v, pred_api.features.value_to_category(i, v)) for (i, v) in zip(indicators, values)}


def future_state(scenario, pred_api):
    """ Assign new values to indicator groups """

    result = {}
    for theme, lbl in scenario.items():

        # Get the set of indicators associated with this theme
        ind = [i['code'] for grp in GROUPING['clusters']
               for i in grp['indicators'] if grp['sub-theme'] == theme]

        # Get the numeric value associated with the label lbl
        result.update({i: pred_api.features.category_to_value(i, lbl) for i in ind})

    return result


def majority_vote(state):
    """ Use a majority vote to aggregate current state """
    votes = [v2 for k, (v1, v2) in state.items()]
    x = Counter(votes)
    return x.most_common(1)[0][0]


if __name__ == "__main__":

    baseyear = 2017

    with open(CONFIGURATION, 'rt') as infile:
        config = json.load(infile)

    pred_api = Scorer(MODELFILE, config, GROUPING, baseyear)

    logger.info("Case 1: No scenarios")
    C1 = pred_api.predict(2018)
    for mt in C1:
        print("{}: {}".format(mt['target'], mt['forecast']))
    logger.info(C1)

    # exit()
    # logger.info("Case 2: Indicator level scenario")
    # C2 = pred_api.predict(2018, future_state({'employment': 'worse'}, pred_api))
    # for mt in C2:
    #    print("{}: {}".format(mt['target'], mt['forecast']))

    logger.info("Case 2: Cluster sensitivity test")
    result = []

    for grp in GROUPING['clusters']:

        # Scenario - i.e. change individual clusters
        for s in LABELS:  # ['best', 'worse']:

            # logger.info("Theme: {}".format(grp['sub-theme']))

            indicators = [i['code'] for i in grp['indicators']]

            curr_state = current_state(pred_api, indicators)
            agg_state = majority_vote(curr_state)
            # logger.info("Current state: {}".format(curr_state))

            scenario = future_state({grp['sub-theme']: s}, pred_api)
            logger.info("Scenario values for {}: {}".format(s, scenario))

            C2 = pred_api.predict(2018, scenario)
            # logger.info("Scenario forecast: {}".format(C2))

            out = [{'destination': a['target'],
                    'theme': grp['sub-theme'],
                    'scenario': s,
                    'current': agg_state,
                    'value': 100*((b['forecast'] - a['forecast'])/a['forecast'])} for (a, b) in zip(C1, C2)]
            # out = {a['target']: 100*((b['forecast'] - a['forecast'])/a['forecast']) for (a, b) in zip(C1, C2)}

            result += out

output = pd.DataFrame(result)

with open("result.pkl", 'wb') as outfile:
    pickle.dump(output, outfile)
