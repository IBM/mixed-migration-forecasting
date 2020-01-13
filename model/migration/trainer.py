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

from sklearn.base import clone
from sklearn.pipeline import Pipeline
from sklearn.compose import TransformedTargetRegressor
from sklearn.preprocessing import StandardScaler, RobustScaler, MinMaxScaler
from sklearn.impute import SimpleImputer
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.decomposition import PCA
from sklearn import linear_model
from sklearn.feature_selection import SelectFromModel

# Ignore LAPACK warning
import warnings
warnings.filterwarnings(action="ignore", module="sklearn", message="^internal gelsd")

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(name)-12s %(levelname)-8s %(message)s')
logger = logging.getLogger(__name__)

CONFIGURATION = os.path.join(os.path.dirname(__file__), "..", "configuration.json")
MODELFILE = os.path.join(os.path.dirname(__file__), "models.joblib")

# Model variants used for ETH use case
MODELS = [(Pipeline([("Preprocessor", SimpleImputer(strategy='mean')),
                     ("Scaler", StandardScaler()),
                     ("Estimator", GradientBoostingRegressor(n_estimators=100,
                                                             max_depth=6,
                                                             learning_rate=0.4,
                                                             loss='ls'))])),
          (Pipeline([("Preprocessor", SimpleImputer(strategy='mean')),
                     ("Scaler", StandardScaler()),
                     ("Estimator", linear_model.LinearRegression())]))]

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
TARGETS = [{'targets': 'ETH.TO.DNK',
            'features': 'ETH+AR',
            'model': ("XGBoost", (Pipeline([("Preprocessor", SimpleImputer(strategy='mean')),
                                            ("Estimator", GradientBoostingRegressor(loss='ls',
                                                                                    n_estimators=10,
                                                                                    learning_rate=0.25,
                                                                                    random_state=42,
                                                                                    max_depth=4))])))},
           {'targets': 'ETH.TO.GBR',
            'features': 'ETH',
            'model': ("XGBoost", (Pipeline([("Preprocessor", SimpleImputer(strategy='mean')),
                                            ('PCA', PCA()),
                                            ("Estimator", GradientBoostingRegressor(loss='huber',
                                                                                    n_estimators=10,
                                                                                    learning_rate=0.5,
                                                                                    random_state=42,
                                                                                    max_depth=3))])))},
           {'targets': 'ETH.TO.ITA',
            'features': 'SSA+AR+DEST+TLAG',
            'model': ("XGBoost", (Pipeline([("Preprocessor", SimpleImputer(strategy='mean')),
                                            ("Estimator", GradientBoostingRegressor(loss='huber',
                                                                                    n_estimators=50,
                                                                                    learning_rate=0.2,
                                                                                    random_state=42,
                                                                                    max_depth=4))])))},
           {'targets': 'ETH.TO.SAU',
            'features': 'SSA+AR+DEST',
            'model': ("XGBoost", (Pipeline([("Preprocessor", SimpleImputer(strategy='mean')),
                                            ("Feature_selection", SelectFromModel(
                                                GradientBoostingRegressor(loss='lad',
                                                                          n_estimators=50,
                                                                          learning_rate=0.4,
                                                                          random_state=42,
                                                                          max_depth=4), threshold='1.0*mean')),
                                            ("Estimator", GradientBoostingRegressor(loss='lad',
                                                                                    n_estimators=50,
                                                                                    learning_rate=0.4,
                                                                                    random_state=42,
                                                                                    max_depth=4))])))},
           {'targets': 'ETH.TO.SWE',
            'features': 'SSA+AR+DEST',
            'model': ("XGBoost", (Pipeline([("Preprocessor", SimpleImputer(strategy='mean')),
                                            ("Estimator", GradientBoostingRegressor(loss='huber',
                                                                                    n_estimators=50,
                                                                                    learning_rate=0.2,
                                                                                    random_state=42,
                                                                                    max_depth=4))])))},
           {'targets': 'ETH.TO.ZAF',
            'features': 'SSA+AR+DEST',
            'model': ("XGBoost", (Pipeline([("Preprocessor", SimpleImputer(strategy='mean')),
                                            ('PCA', PCA()),
                                            ("Estimator", GradientBoostingRegressor(loss='huber',
                                                                                    n_estimators=400,
                                                                                    learning_rate=0.01,
                                                                                    random_state=42,
                                                                                    max_depth=4))])))}
           ]


# One-sided confidence interval
ALPHA = 0.95

# Training data temporal filter
PERIODS = {'train_years': (1995, 2017)}

# Sub-Saharan countries codes
SSA = ['BDI', 'COM', 'DJI', 'ERI', 'ETH', 'ATF', 'KEN', 'MDG', 'MWI',
       'MUS', 'MYT', 'MOZ', 'REU', 'RWA', 'SYC', 'SOM', 'SSD', 'TZA',
       'UGA', 'ZMB', 'ZWE']


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


def generate_features(data, period, target, indicators, feature_sets):
    """
    Generate a feature set for training a model

    inputs:
    data: pandas Dataframe in long form with all indicator variables
    training_years: Tuple showing min-max years to train on, e.g. (1995, 2010)
    target: variable name to forecast e.g. 'ETH.TO.GBR'
    indicators: list of variables to include in the features
    feature_sets: string with feature sets to consider, e.g. 'ETH+TLAG+DEST'

    returns:
        Dictionary with training data
    """

    source, _, destination = target.split(".")
    logger.info("Source: {} Destination: {}".format(source, destination))

    true_feature_var = [f for f in indicators]
    logger.info("Total # indicators: {}".format(len(true_feature_var)))

    dcols = data.columns
    assert target in dcols,\
        "Target variable '{}' must be in data frame.".format(target)
    for fv in indicators:
        assert fv in dcols,\
            "Feature variable '{}' does not exist.".format(fv)

    # Target variable offset by a year (y_(t+1))
    data, varname = lag_variables(data, [target], 1)
    true_target_var = varname[0]

    # Temporal filter: since the target variable is lagged, the training
    # year is one year prior.
    yl, yu = period
    t1 = data.year.between(*(yl, yu - 1))

    # Spatial filter
    if "SSA" in feature_sets:
        t2 = data['Country Code'].isin(SSA)

    elif "ETH" in feature_sets:
        t2 = data['Country Code'] == "ETH"

    else:
        ValueError("Spatial criteria not set (select either SSA/ETH).")

    v2 = data['Country Code'] == source

    # Variable additions
    if "DUMMY" in feature_sets:

        # Generate one hot encodings of the country labels
        tmp = pd.get_dummies(data['Country Code'])

        data = pd.concat([data, tmp], axis=1)

        # Include dummy variables in the feature_set
        # if we have data for them and they are for Sub-Saharan Africa
        true_feature_var += [s for s in SSA if s in tmp.columns]
        logger.info("Included country-specific dummy variables")

    if "AR" in feature_sets:

        # For an AR(1) we just include current year value
        true_feature_var += [target]

        logger.info("Included autoregressive features.")

    if "DEST" in feature_sets:
        # Include feature set from destination country
        idx = data['Country Code'] == destination
        d_df = data.loc[idx, ['year'] + indicators].copy(deep=True)
        data = pd.merge(data, d_df, on='year', suffixes=('', '.DEST'), how='left')
        true_feature_var += [v + ".DEST" for v in indicators]
        logger.info("Included destination features")

    if "TLAG" in feature_sets:
        # Include temporal lag features
        data, varname = lag_variables(data, indicators, -1)
        true_feature_var += varname
        logger.info("Included temporal lag variables")

    # Pull it all together ->
    logger.info("Total number of indicators for feature set {}: {}".format(feature_sets, len(true_feature_var)))

    # Training data
    Xt = data.loc[t1 & t2, true_feature_var]
    yt = data.loc[t1 & t2, true_target_var]

    # Drop missing training labels
    idx = ~pd.isnull(yt)
    yt = yt[idx]
    Xt = Xt[idx]

    return {'data': (Xt, yt)}


def get_data(config):
    """ Get the data from static assets """

    start_time = time()

    sources = [os.path.join(os.path.dirname(__file__), "..", config['paths']['output'],
                            d['name'],
                            'data.csv') for d in config['sources']]

    # Generate a data frame with all indicators
    df = pd.concat((pd.read_csv(f)
                    for f in sources), sort=False, ignore_index=True)

    # Summary stats
    logger.info("Sources            : {}".format(len(sources)))
    logger.info("Row count          : {}".format(len(df)))
    logger.info("Geographies        : {}".format(len(df['Country Name'].unique())))
    logger.info("Indicators         : {}".format(len(df['Indicator Code'].unique())))
    logger.info("Temporal coverage  : {} -> {}".format(df.year.min(), df.year.max()))
    logger.info("Null values        : {}".format(sum(df['value'].isnull())))

    logger.info("Loaded data in {:3.2f} sec.".format(time() - start_time))

    # Now arrange data in long form
    data = pd.pivot_table(df, index=['Country Code', 'year'],
                          columns='Indicator Code', values='value')

    # Consider country/year as features (and not an index)
    data.reset_index(inplace=True)

    # These are the set of indicators to consider
    t_var = [t['targets'] for t in TARGETS]

    # Indicators that can serve as features
    indicators = sorted(list(set(data.columns) - set(t_var + ['Country Code', 'year'])))

    return data, indicators


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
    """ Assemble data and train """

    logger.info("Generating models for {} targets.".format(len(TARGETS)))

    # Get the data
    with open(CONFIGURATION, 'rt') as infile:
        config = json.load(infile)
    data, indicators = get_data(config)

    results = []
    start_time = time()

    for target in TARGETS:

        # Generate instance for model training
        d = generate_features(data=data,
                              period=PERIODS['train_years'],
                              target=target['targets'],
                              indicators=indicators,
                              feature_sets=target['features'])

        Xt, yt = d['data']

        lbl, clf = target['model']

        # make a log-transformed target variable
        # clf = TransformedTargetRegressor(regressor=mod, func=np.log1p, 
        #    inverse_func=np.expm1)

        M = {}

        # What period is this model trained on?
        M['period'] = PERIODS['train_years']

        # Which variable does this forecast?
        M['target'] = target['targets']

        # What indicator sets does it use and in what order?
        M['indicator'] = indicators

        # Which feature set codes are used for this target variable?
        M['features'] = target['features']

        # Persist the training data (for explanations)
        M['Xt'] = Xt

        # Train and persist the model classes
        M['modelname'] = lbl

        # Fit the point forecast model for this target and persist
        clf.fit(Xt, yt)
        M['clf'] = clf

        # Fit the quantile regressor for the upper bound for this target
        # M['CI'] = intervals(Xt, yt)

        results.append(M)

    # Persist the model set
    joblib.dump(results, MODELFILE)

    logger.info("Done with {} runs in in {:3.2f} sec.".format(len(results), time() - start_time))


if __name__ == "__main__":

    execute()
