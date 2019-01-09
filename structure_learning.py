"""
A script version of the notebook on Bayesian networks

Edit: 
- 24 October: Enhancements to data creation (spatial filters + discretization)

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
SSA = ['BDI', 'COM', 'DJI', 'ERI', 'ETH', 'ATF', 'KEN', 'MDG', 'MWI',
       'MUS', 'MYT', 'MOZ', 'REU', 'RWA', 'SYC', 'SOM', 'SSD', 'TZA',
       'UGA', 'ZMB', 'ZWE']

# Get the groups (for labels and inference)
with open("groupings.json", 'rt') as infile:
    GROUPING = json.load(infile)

# Indicators that we use for Scenarios and their relative improvements
INDICATORS = {i['code']: i['direction-improvement'] for grp in GROUPING['clusters'] for i in grp['indicators']}


def get_data():
    start_time = time()
    with open("configuration.json", 'rt') as infile:
        config = json.load(infile)

    sources = [os.path.join(config['paths']['output'],
                            d['name'],
                            'data.csv') for d in config['sources']]

    # Generate a data frame with all indicators
    df = pd.concat((pd.read_csv(f)
                    for f in sources), sort=False, ignore_index=True)

    # Summary stats
    print("Sources            : {}".format(len(sources)))
    print("Row count          : {}".format(len(df)))
    print("Geographies        : {}".format(len(df['Country Name'].unique())))
    print("Indicators         : {}".format(len(df['Indicator Code'].unique())))
    print("Temporal coverage  : {} -> {}".format(df.year.min(), df.year.max()))
    print("Null values        : {}".format(sum(df['value'].isnull())))

    print("\nLoaded data in {:3.2f} sec.".format(time() - start_time))

    # Organize the indicators in "long form"
    data = pd.pivot_table(df, index=['Country Code', 'year'],
                          columns='Indicator Code', values='value')

    # Consider country/year as features (easier to deal with instead of an index)
    data.reset_index(inplace=True)

    # Limit data to Sub-Saharan Africa
    # data = data[data['Country Code'].isin(SSA)]

    # Temporal lag (future) for mixed migration
    mmvars = [k for k in data.columns if k.startswith("ETH.TO")]
    data, _ = lag_variables(data, mmvars, 1, mode='replace')

    # Temporal lag  (past) for employment indicators
    empvars = ["SL.UEM.TOTL.FE.ZS",
               "SL.UEM.TOTL.MA.ZS",
               "SL.UEM.TOTL.ZS"]

    data, _ = lag_variables(data, empvars, -1, mode='replace')

    data.set_index(['Country Code', 'year'], inplace=True)

    print("Number of observations: {}".format(len(data)))

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

    # Migration clusters are afforded a few more states
    if x.name.startswith("ETH.TO"):
        bins = np.arange(0, x.max()+10000, 5000)
        print("Column {}: {} (min) -> {} (max) with {} bins.".format(x.name,
                                                                     x.min(),
                                                                     x.max(),
                                                                     len(bins)))
        return pd.cut(x, bins=bins).astype(str)

    # Quantile discretization of 5 classes for all other numeric quantities

    try:
        print("Column: {}".format(x.name))
        if x.name in INDICATORS.keys():
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

    with open("network.json", 'rt') as infile:
        net = json.load(infile)

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
    return G


def execute_learning(X, G):
    start_time = time()
    model = BayesianNetwork.from_samples(X,
                                         algorithm='exact',
                                         state_names=X.columns,
                                         constraint_graph=G,
                                         n_jobs=256)
    print("Structure learning (constrained) in {:3.2f} sec.".format(
        time() - start_time))

    with open("model2.json", 'wt') as outfile:
        outfile.write(model.to_json())

    print("Output serialized to json and written to model.json")


if __name__ == "__main__":

    data = get_data()

    X = data.apply(discretization, axis=0)
    X.dropna(axis=1, how='all', inplace=True)

    G = get_constraint_graph(X)

    execute_learning(X, G)
    print("Done.")
