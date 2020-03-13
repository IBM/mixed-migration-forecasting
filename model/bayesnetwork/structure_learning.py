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

LABELS = ['worse', 'poor', 'average', 'good', 'best']

# Sub-Saharan countries codes
subglobal = ['SYR','COL','AFG','COG','SSD','SOM','VEN','ETH','SDN','NGA',
             'IRQ','YEM','UKR','MMR','CAF','CMR','ERI','BDI','GEO','MLI',
             'TCD','LBY','NER','BFA','COD']

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
    df = pd.concat((pd.read_csv(f) for f in sources), sort=False, ignore_index=True)

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
        data.rename(columns={v: k for (k, v) in zip(var, col_name)}, inplace=True)
    elif mode == 'retain':
        pass
    else:
        raise ValueError("Mode {} not valid.".format(mode))
    return data, col_name


def discretization(x):
    """ Discretize indicators """

    # Target variable has larger number of bins
    if x.name.startswith("DRC.TOT"):
        print("Column: {}".format(x.name))
        return pd.qcut(x, 10).astype(str)

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

        return pd.qcut(x, 5, labels=lbl, duplicates='drop').astype(str)

    except ValueError:

        # Resort to ranking if data is sparse
        # WARNING: Same values will be discretized to separate bins
        try:
            print("Column: {} +++ Ranked bins".format(x.name))
            return pd.qcut(x.rank(method='first'), 5, labels=lbl, duplicates='drop').astype(str)
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
    print ("Total Improvement: {:4.4}".format(logs['improvement']))


def execute_learning(X, G):
    start_time = time()
    model = BayesianNetwork.from_samples(X,
                                         algorithm='exact',
                                         state_names=X.columns,
                                         constraint_graph=G,
                                         max_parents=3, verbose=True,
                                         n_jobs=-1)
    print("Structure learning (constrained) in {:3.2f} sec.".format(
        time() - start_time))

    with open("model.json", 'wt') as outfile:
        outfile.write(model.to_json())

    print("Output serialized to json and written to model.json")


if __name__ == "__main__":

    data = get_data()
    G, indicators = get_constraint_graph(data)

    INDICATORS = {i['code']: i['direction-improvement'] for i in indicators}

    X = data[list(INDICATORS.keys())].apply(discretization, axis=0)
    X.dropna(axis=1, how='all', inplace=True)

    execute_learning(X, G)
    print("Done.")
