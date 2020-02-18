"""
Model configuration parameters
"""
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.ensemble import GradientBoostingRegressor

# Countries for which forecasts are generated, ISO-3 codes.
COUNTRIES = ['AFG', 'MMR']

# Earliest year to include for building the model
MIN_YEAR = 1995

# A forecast is made for a base-year, defined in `configuration.json`
# Lags here define years from the base year for which the prediction
# models are trained and generate forecasts. Mean-absolute percentage
# error beyond year 3 can be high (~25-30%).
LAGS = [0, 1, 2, 3, 4, 5]

# If indicators for a country are old, we will attempt an indicator
# level projection using an ARIMA model. The projection is this included
# in the model. Here we can constrain the number of years we can project
# for.
PROJECTION_MAX_LAGS = 3

# End user labels (used to assign quantiles of indicators)
LABELS = ['worse', 'poor', 'average', 'good', 'best']

# Target variable in the data - this is the internally displaced
# population + total external population.
TARGETS = ['DRC.TOT.DISP']

# Feature configurations

# Feature exclusions (these features are excluded from training/predictions)
# Everything else in the data are considered as a feature.
FE_IDX = ['Country Code', 'year']
FE_MM = ['ETH.TO.{}'.format(i)
         for i in ['DNK', 'GBR', 'ITA', 'SAU', 'SWE', 'ZAF']]
FE_ENDO = ['UNHCR.OUT.AS', 'UNHCR.OUT.IDP', 'UNHCR.OUT.OOC',
           'UNHCR.OUT.REF', 'UNHCR.OUT.RET', 'UNHCR.OUT.RETIDP']
FE_MISSING = ['EMDAT.CPX.OCCURRENCE', 'EMDAT.CPX.TOTAL.DEATHS',
              'EMDAT.CPX.TOTAL.AFFECTED', 'EMDAT.CPX.AFFECTED']


def feature_sets(cols):
    """ Country specific feature sets """

    allfeatures = list(set(cols) - set(FE_IDX + FE_MM + FE_ENDO + FE_MISSING))

    # We have some Myanmar specific data there
    mmr_data = [f for f in allfeatures if f.startswith('MMR.NSO')]

    features = {
        'all': allfeatures,
        'AFG': list(set(allfeatures) - set(mmr_data)),
        'MMR': allfeatures}
    
    return features

# Model specifications:
# The remainder of these will be updated once experiments are complete.

CLF = Pipeline([("Preprocessor", SimpleImputer(strategy='mean')),
                ("Estimator", GradientBoostingRegressor(n_estimators=500,
                                                        max_depth=6,
                                                        learning_rate=0.1,
                                                        loss='ls'))])

# Empirical bootstrap error results for 95% CI (these are computed
# in the exploratory/Displacement Forecasts.ipynb notebook)
# TODO:
CI_LOOKUP = {('AFG', 1): {'lower': 95671.38802200087, 'upper': 498273.9865344732},
             ('AFG', 2): {'lower': 95775.92203712976, 'upper': 485417.5078871537},
             ('AFG', 3): {'lower': 82110.733467414, 'upper': 517566.08459815086},
             ('AFG', 4): {'lower': 91059.84676786399, 'upper': 565971.2516878153},
             ('AFG', 5): {'lower': 273563.39880516473, 'upper': 670423.0911384362},
             ('AFG', 6): {'lower': 594069.1856631859, 'upper': 832696.0595408867},
             ('MMR', 1): {'lower': 47899.69608123234, 'upper': 236411.6306831434},
             ('MMR', 2): {'lower': 47662.79860382158, 'upper': 239130.9937380911},
             ('MMR', 3): {'lower': 48781.772393325264, 'upper': 240009.12752662893},
             ('MMR', 4): {'lower': 60903.23593884809, 'upper': 244049.93522725202},
             ('MMR', 5): {'lower': 65907.04621774254, 'upper': 268163.07676308986},
             ('MMR', 6): {'lower': 77751.24012441446, 'upper': 296631.7712564872}}
