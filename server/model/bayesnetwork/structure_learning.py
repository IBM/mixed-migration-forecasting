"""
Structure learning for forced displacement.

"""

import os
import json
import pandas as pd
import numpy as np
from time import time
from pomegranate import BayesianNetwork
import networkx
import tempfile
import pickle
import argparse
import datetime
from itertools import product

import faulthandler
faulthandler.enable()


LABELS = ['worse', 'poor', 'average', 'good', 'best']

# Sub-Saharan countries codes
subglobal = ['SYR', 'COL', 'AFG', 'COG', 'SSD', 'SOM', 'VEN', 'ETH', 'SDN', 'NGA',
             'IRQ', 'YEM', 'UKR', 'MMR', 'CAF', 'CMR', 'ERI', 'BDI', 'GEO', 'MLI',
             'TCD', 'LBY', 'NER', 'BFA', 'COD']

CONFIGURATION = "configuration.json"
NETWORK = "model/bayesnetwork/network.json"


def get_data():

    start_time = time()
    with open(CONFIGURATION, 'rt') as infile:
        config = json.load(infile)

    sources = [os.path.join(config['paths']['output'],
                            d['name'],
                            'data.csv') for d in config['sources'] if d['name']]

    # Generate a data frame with all indicators
    df = pd.concat((pd.read_csv(f)
                    for f in sources), sort=False, ignore_index=True)

    # Summary stats
    print("Sources            : {}".format(len(sources)))
    print("Shape              : {} (rows) {} (columns)".format(*df.shape))
    print("Geographies        : {}".format(len(df['Country Name'].unique())))
    print("Indicators         : {}".format(len(df['Indicator Code'].unique())))
    print("Temporal coverage  : {} -> {}".format(df.year.min(), df.year.max()))
    print("Null values        : {}".format(sum(df['value'].isnull())))

    print("\nLoaded data in {:3.2f} sec.".format(time() - start_time))

    # Now arrange data in wide form
    data = pd.pivot_table(df, index=['Country Code', 'year'],
                          columns='Indicator Code', values='value')

    # Consider country/year as features (and not an index)
    data.reset_index(inplace=True)

    print("Long form of size  : {} (rows) {} (columns)".format(*data.shape))

    # Spatial filter
    c1 = data['Country Code'].isin(subglobal)

    # Temporal filter
    c2 = data['year'] >= 1980
    data = data[c1 & c2]

    print("Filtered data of size  : {} (rows) {} (columns)".format(*data.shape))

    print("Null values            : {}".format(pd.isnull(data).sum().sum()))

    data = data.fillna(method='bfill').fillna(method='ffill')

    # Generate the displacement stock per 100K inhabitants
    print("Generating displacement stock per 100K inhabitants")
    print(
        "{} -> {}".format(data['DRC.TOT.DISP'].min(), data['DRC.TOT.DISP'].max()))
    data['DRC.TOT.DISP'] = 100000 * data['DRC.TOT.DISP'] / data["SP.POP.TOTL"]
    print(
        "{} -> {}".format(data['DRC.TOT.DISP'].min(), data['DRC.TOT.DISP'].max()))

    data.set_index(['Country Code', 'year'], inplace=True)
    return data


def lag_variables(data, var, lag, mode="replace"):
    """
    Append lagged variables to frame.
    var - list of variable names (column names) to lag
    lag - integer (years to lag the variables by)
    model - "replace" or "retain" the original columns
    """
    idx_cols = ['year', 'Country Code']
    fv = var + idx_cols

    tmp = data[fv].copy(deep=True)

    col_name = [v + ".T" + "{0:+}".format(lag) for v in var]
    tmp.rename(columns={k: v for (k, v) in zip(var, col_name)}, inplace=True)
    tmp.year -= lag
    data = pd.merge(data, tmp, on=idx_cols, how='left')
    if mode == 'replace':
        data.drop(columns=var, inplace=True)
        # Hack to keep the network files consistent
        data.rename(columns={v: k for (k, v) in zip(
            var, col_name)}, inplace=True)
    elif mode == 'retain':
        pass
    else:
        raise ValueError("Mode {} not valid.".format(mode))
    return data, col_name

BINLABELS = {}

def discretization(x):
    """ Discretize indicators """

    # Target variable has larger number of bins
    if x.name.startswith("DRC.TOT"):
        print("Column: {}".format(x.name))
        s, bins = pd.qcut(x, 10, retbins=True)
        BINLABELS[x.name] = bins.tolist()
        return s.astype(str)

    # Quantile discretization of 5 classes for all other numeric quantities

    try:
        if x.name in INDICATORS.keys():
            print("Column: {}".format(x.name))

            if INDICATORS[x.name] == "higher":
                lbl = LABELS
            else:
                lbl = list(reversed(LABELS))
        else:
            # We don't use these labels
            lbl = LABELS

        s, bins = pd.qcut(x, 5, labels=lbl, duplicates='drop', retbins=True)
        BINLABELS[x.name] = bins.tolist()
        return s.astype(str)

    except ValueError:

        # Resort to ranking if data is sparse
        # WARNING: Same values will be discretized to separate bins
        try:
            print("Column: {} +++ Ranked bins (n={})".format(x.name, sum(~pd.isnull(x))))
            s, bins = pd.qcut(x.rank(method='first'), 5, labels=lbl, duplicates='drop', retbins=True)
            BINLABELS[x.name] = bins.tolist()
            return s.astype(str)

        except ValueError:
            print("Column: {} ------------- ERROR.".format(x.name))
            return None


def get_constraint_graph(X):
    """ Read in the user specified constrained network """
    G = networkx.DiGraph()
    cols = X.columns.tolist()

    nodes = {}  # node to ID dictionary

    with open(NETWORK, 'rt') as infile:
        net = json.load(infile)
    indicators = net['indicators']

    # Driver clusters (node sets) from expert-network
    for clus, indicator in net['nodes'].items():

        # build the index sets based on the data
        index = []
        for i in indicator:
            try:
                index.append(cols.index(i))
            except ValueError:
                raise ValueError("{} indicator not in data.".format(i))

        nodes[clus] = index

    # Map the edges
    edge_count = 0
    for clus, to_nodes in net['edges'].items():

        fidx = nodes[clus]

        for tn in to_nodes:

            tidx = nodes[tn]

            if fidx and tidx:

                G.add_edge(tuple(fidx), tuple(tidx))
                edge_count += 1

    print("Domain network with {} node clusters and {} edges.".format(
        len(nodes), edge_count))

    return G, indicators


def rte(logs):
    print("Total Improvement: {:4.4}".format(logs['improvement']))


def get_parent_structure(G, X):
    """ Translates G into the structure of tuple of tuples
    that pomegranate expects.
    A bit convoluted by:
    - G is defined for clusters of nodes, while the structure
    is for indicators
    """
    parentset = {}
    for parent_c, child_c in G.edges():
        for p, c in product(parent_c, child_c):
            try:
                parentset[c].append(p)
            except KeyError:
                parentset[c] = [p]
    
    struct =[]
    for i, c in enumerate(X.columns):
        if i in parentset.keys():
            struct.append(tuple(parentset[i]))
        else:
            struct.append(tuple())
            
    return tuple(struct)

def execute_learning(X, G, algo, constrained):
    """
    Wrapper to run bayesian learning
    X - evidence (dataframe)
    G - domain expert graph (DiGraph)
    algo - one of ('greedy', 'exact', 'no-struct')
    constrained (bool) - use G to constrain search if true

    returns None (model persisted to disk)
    """
    start_time = time()
    if algo in ['exact', 'greedy']:
        print("Starting structure learning algorithm:{} constrained:{}.".format(algo, str(constrained)))
        cg = G if constrained else None
        print(algo)
        print(G.nodes)
        model = BayesianNetwork.from_samples(X,
                                             algorithm=algo,
                                             state_names=X.columns,
                                             constraint_graph=cg,
                                             # max_parents=3,
                                             n_jobs=-1)
    elif algo == 'no-struct':

        raise NotImplementedError
        # FIXME: Conditional probability tables are too large for the current
        # configuration.
        print("Learning probabilites from known structure.")
        struct = get_parent_structure(G, X)
        model = BayesianNetwork.from_structure(X, struct,
                                              state_names=X.columns)
    
    model.bake()

    print("Completed in {:3.2f} sec.".format(
        time() - start_time))

    timestr = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
    with open("{}.model-{}-{}.json".format(timestr, algo, constrained), 'wt') as outfile:
        outfile.write(model.to_json())

    print("Output serialized to json and persisted.")


if __name__ == "__main__":

    parser = argparse.ArgumentParser(prog='Bayesian network learning')
    algor = parser.add_mutually_exclusive_group(required=False)
    algor.add_argument('--exact', dest='algo', action='store_const',
                       const='exact', help='Use the exact structure learning routine.')
    algor.add_argument('--greedy', dest='algo', action='store_const',
                       const='greedy', help='Use a greedy algorithm to learn structure.')
    algor.add_argument('--no-struct', dest='algo', action='store_const',
                       const='no-struct', help='Use structure provided and only learn probabilities')

    graph = parser.add_mutually_exclusive_group(required=False)
    graph.add_argument('--constrained', dest='constrained',
                       action='store_true')
    graph.add_argument('--unconstrained', dest='constrained',
                       action='store_false')

    parser.set_defaults(algo='greedy', constrained=True)

    args = parser.parse_args()

    # Fetch the data
    data = get_data()

    # Load the indicator definitions
    with open(NETWORK, 'rt') as infile:
        net = json.load(infile)
    indicators = net['indicators']

    INDICATORS = {i['code']: i['direction-improvement'] for i in indicators}
    X = data[list(INDICATORS.keys())].apply(discretization, axis=0)

    X.to_csv("exploratory/foresight.csv")
    json.dump(BINLABELS, open("exploratory/bins.json", 'w'))
    X.to_pickle("exploratory/df.pkl")
    G, _ = get_constraint_graph(X)

    # Run
    execute_learning(X, G, **vars(args))
    print("Done.")
