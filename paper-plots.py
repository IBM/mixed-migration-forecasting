"""
Paper results for the IBM R&D journal based on the evaluation results
obtained by running the `evaluation.py` script.
"""

# %% Test

import matplotlib.pyplot as plt
import pickle
import pandas as pd
import numpy as np
from sklearn import metrics

with open("result.pkl", 'rb') as infile:
    result = pickle.load(infile)

df = pd.DataFrame(result)
df.dropna(axis=0, inplace=True)

# %%
# Fraction of forecasts within xx% error
dy = np.abs(df.truth - df.forecast)
for i in [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 1.0]:
    err_cnt = sum(dy <= i * df.truth)
    print("Fraction within {}%% error {:2.1f}%% ({} of {}) ".format(100*i, 
                100*err_cnt/len(dy), err_cnt, len(dy)))
                
# %%
idx = np.abs(df.truth - df.forecast) >= 0.7 * df.truth
df[idx]
# %%
df.loc[df.current == df.scenario, 'value'] = np.nan

bins = [-1000, -50, -10, -5, 5, 10, 50, 1000]
names = ['---', '--', '-', 'o', '+', '++', '+++']

df['rep'] = pd.cut(df.value, bins, labels=names)

# %%
df['tmp'] = df.theme + "-" + df.scenario
res = df.pivot(values='value', index='destination', columns='tmp')

THEMES = df.theme.unique()
LABELS = ['worse', 'poor', 'average', 'good', 'best']
res = res[[k2 + "-" + k1 for k2 in THEMES for k1 in LABELS]]
res.to_csv("tmp.csv")
# %%


def improvements(x):
    """
    Average percentage improvement in error over base line
    """
    y, b, f = x.truth, x.baseline, x.forecast

    db = np.abs(y - b)
    dy = np.abs(y - f)

    db[db <= 0.001] = 0.001

    return sum(db >= dy)/float(len(x))

    # return np.mean((db - dy)/db)


def mape(x, value='forecast'):
    assert value in ['baseline', 'forecast'], "Unknown value for metric"
    y_true, y_pred = x.truth, x[value]
    return np.mean(np.abs((y_true - y_pred) / y_true)) * 100


def mae(x, value='forecast'):
    assert value in ['baseline', 'forecast'], "Unknown value for metric"
    y, f = x.truth, x[value]
    return metrics.mean_absolute_error(y, f)


def errormetrics(x):
    return pd.DataFrame({'mae': [mae(x)],
                         'baseline-mae': [mae(x, value='baseline')],
                         'mape': [mape(x)],
                         'baseline-mape': [mape(x, value='baseline')],
                         'n': len(x)})
    # return pd.DataFrame({'mae': [mae(x)]})


# The basic error metric
groups = df.groupby(['target']).apply(errormetrics)

print("Mean abs. error", groups['mae'].mean())
print("Count of number of ")

print(groups.head(10))

# %% Missed forecast calculations

THRESHOLD = 40000

df['missed'] = np.abs(df.truth - df.forecast) > THRESHOLD

missed_group = df[~df.missed].groupby(['target']).apply(errormetrics)
missed_group.head(10)

# %%
df[['target', 'missed']].groupby(['target']).sum()
