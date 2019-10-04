"""
Determine hyper parameters for SAU model
"""
import json
import pandas as pd
from time import time
from model import trainer
from sklearn.model_selection import GridSearchCV
from sklearn.preprocessing import FunctionTransformer

from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.ensemble import GradientBoostingRegressor

import warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)

# Things to test
parameters = {
    'Estimator__loss': ['ls', 'lad', 'huber'],
    'Estimator__n_estimators': [10, 50, 100, 150, 200, 300, 350, 400, 500],
    'Estimator__learning_rate': [0.001, 0.01, 0.05, 0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 1.0],
    'Estimator__max_depth': [3, 4, 5, 6]
}

FSETS = ['ETH', 'SSA',
         'ETH+AR', 'SSA+AR',
         'ETH+AR+DEST', 'SSA+AR+DEST',
         'ETH+AR+DEST+TLAG', 'SSA+AR+DEST+TLAG']

# Get a data instance
CONFIGURATION = "configuration.json"

with open(CONFIGURATION, 'rt') as infile:
    config = json.load(infile)

data, indicators = trainer.get_data(config)


# Run grid search for each instance for each feature set

result = {}
for target_config in trainer.TARGETS:
    target = target_config['targets']

    for fs in FSETS:
        # Get the y
        d = trainer.generate_features(data=data,
                                      period=(1995, 2017),
                                      target=target,
                                      indicators=indicators,
                                      feature_sets=fs)
        X, y = d['data']

        clf = Pipeline([("Preprocessor", SimpleImputer(strategy='mean')),
                        ("Scaler", StandardScaler()),
                        ("Estimator", GradientBoostingRegressor(n_estimators=100,
                                                                max_depth=6,
                                                                learning_rate=0.4,
                                                                random_state=42,
                                                                loss='ls'))])

        # Execute the grid search
        grid_search = GridSearchCV(clf, parameters, scoring='neg_mean_absolute_error',
                                   cv=5, n_jobs=-1, verbose=1)

        print("Performing grid search...")
        print("pipeline:", [name for name, _ in clf.steps])
        print("parameters:")
        print(parameters)
        t0 = time()
        grid_search.fit(X, y)
        print("done in %0.3fs" % (time() - t0))

        best_score = grid_search.best_score_
        par_res = grid_search.best_estimator_.get_params()
        best_parameters = {pn: par_res[pn] for pn in parameters.keys()}
        print("Best score %s: %0.3f" % (fs, best_score))
        print("Best parameters set:")
        for param_name in sorted(parameters.keys()):
            print("\t%s: %r" % (param_name, best_parameters[param_name]))

        try:
            _, sc, ofs = result[target]
            if best_score > sc:
                result[target] = best_parameters, best_score, fs
                print("{} did better than {} for {} ".format(fs, ofs, target))

        except KeyError:
            result[target] = best_parameters, best_score, fs

print("Done")
print(result)
