"""
Offline script to train all the models

"""

from sklearn.externals import joblib
import numpy as np
import pandas as pd
import logging
import os
import json
from time import time

from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.ensemble import GradientBoostingRegressor
from sklearn import linear_model
from sklearn.svm import SVR
from sklearn.model_selection import train_test_split
from sklearn import metrics


# Years to predict the variables for (all one-year ahead for now)
PERIODS = [{'train_years': (1995, Y-1),
            'predict_year': Y } for Y in np.arange(2011, 2016, 1)]

# Models to evaluate
MODELS = [('XGBoost-0.1', Pipeline([("Preprocessor", SimpleImputer(strategy='mean')),
                                ("Estimator", GradientBoostingRegressor(n_estimators=500,
                                                                 max_depth=6,
                                                                 learning_rate=0.1,
                                                                 loss='ls'))]))]
""",
          ('XGBoost-0.001', Pipeline([("Preprocessor", SimpleImputer(strategy='mean')),
                                ("Estimator", GradientBoostingRegressor(n_estimators=500,
                                                                 max_depth=6,
                                                                 learning_rate=0.001,
                                                                 loss='lad'))])),
          ("Linear Regression", linear_model.LinearRegression()),
          ("Support Vector Regression", SVR(gamma='auto'))]
"""
MODELFILE = os.path.join(os.path.dirname(__file__), "models.joblib")

# Grid search results. See `gridsearch.py`
"""
opt = {'ETH.TO.DNK': ({'Estimator__loss': 'ls', 'Estimator__n_estimators': 10,
                       'Estimator__learning_rate': 0.25, 'Estimator__max_depth': 4}, -39.478791361915135, 'ETH+AR'),
       'ETH.TO.GBR': ({'Estimator__loss': 'huber', 'Estimator__n_estimators': 10,
                       'Estimator__learning_rate': 0.5, 'Estimator__max_depth': 3}, -498.52943778887635, 'ETH'),
       'ETH.TO.ITA': ({'Estimator__loss': 'huber', 'Estimator__n_estimators': 50,
                       'Estimator__learning_rate': 0.2, 'Estimator__max_depth': 4},
                       -245.6855299734031, 'SSA+AR+DEST+TLAG'),
       'ETH.TO.SAU': ({'Estimator__loss': 'lad', 'Estimator__n_estimators': 50,
                       'Estimator__learning_rate': 0.4, 'Estimator__max_depth': 4}, -1974.7033225458915, 'SSA+AR+DEST'),
       'ETH.TO.SWE': ({'Estimator__loss': 'huber', 'Estimator__n_estimators': 50,
                       'Estimator__learning_rate': 0.2, 'Estimator__max_depth': 4}, -338.92063046545053, 'SSA+AR+DEST'),
       'ETH.TO.ZAF': ({'Estimator__loss': 'huber', 'Estimator__n_estimators': 400,
                       'Estimator__learning_rate': 0.01, 'Estimator__max_depth': 4}, -2587.6473680302806, 'SSA+AR+DEST')}
"""


# See `gridsearch.py` for hyper-parameter/feature set selections
TARGETS = ['IDP', 'UNHCR.EDP']


# One-sided confidence interval
ALPHA = 0.95




def missing_vals(x, v=-100000.0):
    """ Helper function, since scikit doesn't handle missing values """
    idx = np.isnan(x)
    x[idx] = v
    return x


def intervals(Xt, yt):
    """ Returns a fitted Quantile regressor for confidence interval """

    # Handle missing values - since scikit doesn't deal
    # with this.
    # Xt = missing_vals(Xt)
    clf = Pipeline([("Preprocessor", SimpleImputer(strategy='mean')),
                    ("Estimator", GradientBoostingRegressor(loss='quantile',
                                                            alpha=ALPHA,
                                                            n_estimators=250,
                                                            max_depth=3,
                                                            learning_rate=.1,
                                                            min_samples_split=9))])

    clf.fit(Xt, yt)

    return clf


def lag_variables(data, var, lag):
    """
    Append lagged variables to frame.

    data - pandas data frame
    var - list of variable names to lag
    lag - integer

    """
    idx_cols = ['year', 'Country Code']
    fv = var + idx_cols

    tmp = data[fv].copy(deep=True)

    col_name = [v + ".T" + "{0:+}".format(lag) for v in var]

    tmp.rename(columns={k: v for (k, v) in zip(var, col_name)},
               inplace=True)
    tmp.year -= lag
    data = pd.merge(data, tmp, on=idx_cols, how='left')

    return data, col_name

def generate_features(data,
                      training_years,
                      forecast_year,
                      country,
                      target_var,
                      feature_var):
    """
    Generate a feature set for training/test

    data: pandas Dataframe in long form with all indicator variables
    training_years: Tuple showing min-max years to train on, e.g. (1995, 2010)
    forecast_year: test year, (2011)
    country: ISO3 code (e.g. 'AFG')
    target_var: variable name to forecast e.g. 'FD'
    feature_var: list of variables to include

    returns:
        Dictionary with training, test data, along with the baseline
        Baseline is the latest flow in the training data.
    """

    true_feature_var = [f for f in feature_var]
    print("Total # Features: {}".format(len(true_feature_var)))

    dcols = data.columns
    assert target_var in dcols, \
        "Target variable '{}' must be in data frame.".format(target_var)

    for fv in feature_var:
        assert fv in dcols, \
            "Feature variable '{}' does not exist.".format(fv)

    # Get the poor man's forecast as baseline
    bv = data.loc[(data.year == forecast_year - 1) &
                  (data['Country Code'] == country), target_var].values[0]
    print("Baseline value: {} (year {})".format(bv, forecast_year - 1))

    # Get the true value
    tr = data.loc[(data.year == forecast_year) &
                  (data['Country Code'] == country), target_var].values[0]
    print("True value: {} (year {})".format(tr, forecast_year))

    # Target variable offset by a year (y_(t+1))
    data, varname = lag_variables(data, [target_var], 1)
    true_target_var = varname[0]

    # Temporal filter: since the target variable is lagged, the training
    # year is one year prior.
    yl, yu = training_years
    t1 = data.year.between(*(yl, yu - 1))
    v1 = data.year == forecast_year - 1

    # Spatial filter
    t2 = data['Country Code'] == country

    # For an AR(1) we just include current year value
    true_feature_var += [target_var]

    # Handle the missing features
    data = data.fillna(method='ffill').fillna(method='bfill')

    # Training data
    Xt = data.loc[t1 & t2, true_feature_var]
    yt = data.loc[t1 & t2, true_target_var]

    # Forecast/validation data
    Xv = data.loc[v1 & t2, true_feature_var]
    yv = data.loc[v1 & t2, true_target_var]

    # Drop missing training labels
    idx = ~pd.isnull(yt)
    yt = yt[idx]
    Xt = Xt[idx]

    #print(true_feature_var)

    return {'data': (Xt, yt, Xv, yv), 'baseline': bv, 'true': tr, 'Country code': country}


def get_data():
    """ Get the data from static assets """

    start_time = time()
    with open("../configuration.json", 'rt') as infile:
        config = json.load(infile)

    sources = [os.path.join("..", config['paths']['output'],
                            d['name'],
                            'data.csv') for d in config['sources']]

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

    # Now arrange data in long form
    data = pd.pivot_table(df, index=['Country Code', 'year'],
                          columns='Indicator Code', values='value')

    # Consider country/year as features (and not an index)
    data.reset_index(inplace=True)

    # Define the subset to work with

    countries = ['AFG', 'MMR']

    # Features
    idx = ['Country Code', 'year']
    mm = ['ETH.TO.{}'.format(i) for i in ['DNK', 'GBR', 'ITA', 'SAU', 'SWE', 'ZAF']]
    endo = ['UNHCR.OUT.AS', 'UNHCR.OUT.IDP', 'UNHCR.OUT.OOC',
            'UNHCR.OUT.REF', 'UNHCR.OUT.RET', 'UNHCR.OUT.RETIDP']
    # missing entirely
    emdat = ['EMDAT.CPX.OCCURRENCE', 'EMDAT.CPX.TOTAL.DEATHS', 'EMDAT.CPX.TOTAL.AFFECTED', 'EMDAT.CPX.AFFECTED']
    target = ['IDP', 'UNHCR.EDP']
    features = list(set(data.columns.tolist()) - set(idx + mm + endo + target + emdat))

    # filter
    c1 = data['Country Code'].isin(countries)
    c2 = data.year >= 1950

    df = data.loc[c1 & c2, idx + features + target]
    df['TARGET'] = df['IDP'] + df['UNHCR.EDP']
    return df,features


def lag_variables(data, var, lag):
    """
    Append lagged variables to frame.

    data - pandas data frame
    var - list of variable names to lag
    lag - integer (years to lag the variables by)

    """
    idx_cols = ['year', 'Country Code']
    fv = var + idx_cols

    tmp = data[fv].copy(deep=True)

    col_name = [v + ".T" + "{0:+}".format(lag) for v in var]
    tmp.rename(columns={k: v for (k, v) in zip(var, col_name)}, inplace=True)
    tmp.year -= lag
    data = pd.merge(data, tmp, on=idx_cols, how='left')

    return data, col_name


def execute():
    results = []
    batch = 0
    start_time = time()
    df, features = get_data()

    countries = ['AFG', 'MMR']
    # Features


    for c in countries:
        for p in PERIODS:

            batch += 1

        # Generate problem instance
            d = generate_features(df,
                  p['train_years'],
                  p['predict_year'],
                c,
                  "TARGET",
                  features)

            Xt, yt, Xv, yv = d['data']

            for lbl, clf in MODELS:

                M = {}
                M['batch'] = batch
                M['period'] = p
                M['target'] = "FORCED_DISPLACEMENT"
                M['baseline'] = d['baseline']
                M['true'] = yv.values[0]
                M['country'] = c

                # And finally run
                M['model'] = lbl

                clf.fit(Xt, yt)
                M['clf'] = clf

                fc = clf.predict(Xv)
                M['forecast'] = fc[0]

            # MAE
                M['mae'] = metrics.mean_absolute_error(yv, fc)

                results.append(M)

    joblib.dump(results, MODELFILE)


if __name__ == "__main__":

    execute()
