"""
Grid search to determine hyper parameters.
"""
import json
import numpy as np
import pandas as pd
from time import time
from model.displacement import *
from model.displacement.model import Trainer
from model.displacement.features import Generator

from sklearn.model_selection import GridSearchCV
from sklearn.preprocessing import FunctionTransformer
from sklearn.model_selection import TimeSeriesSplit

from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.ensemble import GradientBoostingRegressor

import warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)

# Get a data instance
CONFIGURATION = "configuration.json"

with open(CONFIGURATION, 'rt') as infile:
    config = json.load(infile)


# Model dimensions to determine
parameters = {
    'Estimator__loss': ['ls', 'lad', 'huber'],
    'Estimator__n_estimators': [10, 50, 100, 150, 200, 300, 350, 400, 500],
    'Estimator__learning_rate': [0.001, 0.01, 0.05, 0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 1.0],
    'Estimator__max_depth': [3, 4, 5, 6]
}

CLF = Pipeline([("Estimator", GradientBoostingRegressor(random_state=42))])

# Set of parameters for each model
LAGS = [0, 1, 2, 3, 4, 5]
COUNTRIES = config['supported-countries']['displacement']
result = []

generator = Generator(config, 2019) # Base year is not used

def get_data(c, lg):
    """ Custom feature generator """

    # source data
    df = generator.proj_df.copy(deep=True)
    
    if lg > 0:
        data, varname = generator._Generator__lag_variables(df, TARGETS, lg)
        true_target_var = varname
        true_feature_var = generator.indicators[c] + TARGETS

    else:
        data = df.copy(deep=True)
        true_target_var = TARGETS
        true_feature_var= generator.indicators[c]

    c1 = data['Country Code'] == c
    c2 = ~pd.isnull(data[true_target_var[0]])
    
    df = data.loc[c1 & c2, ['year'] + true_feature_var + true_target_var]
    df = df.sort_values(by=['year'])
    df = (df.fillna(method='ffill')
                .fillna(method='bfill'))

    X = df[true_feature_var]
    y = df[true_target_var]
    X = X.dropna(axis=1, how='all')

    print("Country: {}, lag: {}".format(c, lg))
    print("Data has {} rows, {} cols.".format(*df.shape))
    
    return X.values, np.ravel(y.values)

def execute():
    for lg in LAGS:
        for c in COUNTRIES:

            # get the data
            X, y = get_data(c, lg)

            # define the splits
            tscv = TimeSeriesSplit(n_splits=10)

            # do the grid search. Scoring follows the convention that
            # higher values are better (hence the `neg')
            grid_search = GridSearchCV(CLF, parameters, scoring='neg_mean_absolute_error',
                                    cv=tscv.split(X), n_jobs=-1, verbose=1)

            print("Performing grid search...")
            t0 = time()
            grid_search.fit(X, y)
            print("done in %0.3fs" % (time() - t0))

            # record best result
            par_res = grid_search.best_estimator_.get_params()
            
            m = {pn: par_res[pn] for pn in parameters.keys()}
            m['country'] = c
            m['lag'] = lg
            
            result.append(m)


    json.dump(result, open("model/displacement/params.json", 'w'))
    print("Done")

if __name__ == "__main__":
    execute()
