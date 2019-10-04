
# Test Transformed regressor

from sklearn.compose import TransformedTargetRegressor
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.pipeline import Pipeline 
from sklearn.impute import SimpleImputer
import numpy as np
import pandas as pd

data = np.random.rand(100, 3)

pipe = Pipeline([('preproc', SimpleImputer()), 
                ('regressor', GradientBoostingRegressor())])

# Do the log transform
clf = TransformedTargetRegressor(regressor=pipe, 
            func=np.log1p, 
            inverse_func=np.expm1)

clf.fit(data[:, 0:2], data[:, 2])
print(clf.predict(np.array([.54346771, 0.61627506]).reshape(1, -1)))
