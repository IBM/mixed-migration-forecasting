"""
Model configuration parameters
"""
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.ensemble import GradientBoostingRegressor

# Countries for which forecasts are generated, ISO-3 codes.
COUNTRIES = ['AFG', 'MMR']

# Earliest year to include for building the forecast model
MIN_YEAR = 1995

# Earliest year to estimate elasticities 
MIN_OLS_YEAR = 1980

# A forecast is made for a base-year, defined in `configuration.json`
# Lags here define years from the base year for which the prediction
# models are trained and generate forecasts. Mean-absolute percentage
# error beyond year 3 can be high (~25-30%).
LAGS = [0, 1, 2, 3, 4, 5]

# Scenario-specific lags do not have any statistically significant results
# beyond lag = 1. Restrict to year 0 and year 1.
SCENARIO_LAGS = [0, 1]

# If indicators for a country are old, we will attempt an indicator
# level projection using an AR model. The projection is then included
# in the model. Here we can constrain the number of years we can project
# for.
PROJECTION_MAX_LAGS = 3

# End user labels
LABELS = ['-10%', '-5%', 'NC', '+5%', '+10%']

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

    allfeatures = list(set(cols) - set(FE_IDX + FE_MM + FE_ENDO + FE_MISSING + TARGETS))

    # We have some Myanmar specific data there
    mmr_data = [f for f in allfeatures if f.startswith('MMR.NSO')]

    features = {
        'all': allfeatures,
        'AFG': list(set(allfeatures) - set(mmr_data)),
        'MMR': allfeatures}
    
    return features

# Model specification:
CLF = Pipeline([("Estimator", GradientBoostingRegressor(n_estimators=500,
                                                        random_state=42,
                                                        max_depth=6,
                                                        learning_rate=0.1,
                                                        loss='ls'))])

# Empirical bootstrap error results for 95% CI (these are computed
# in the exploratory/Displacement Forecasts.ipynb notebook). This is
# based on the evaluation tests between 2010 - 2017. Very small observation
# set. Even with 1000 resamples, difficult to accurately estimate intervals
# so comes with caveats.
CI_LOOKUP = {('AFG', 0): {'lower': 60793.58326530255, 'upper': 208890.31858752394},
 ('AFG', 1): {'lower': 259521.12744958268, 'upper': 638928.9884730228},
 ('AFG', 2): {'lower': 173082.17190883713, 'upper': 557146.7713506239},
 ('AFG', 3): {'lower': 208482.90166660104, 'upper': 744279.4557944484},
 ('AFG', 4): {'lower': 408238.34708669543, 'upper': 787257.4590383921},
 ('AFG', 5): {'lower': 233521.0772038539, 'upper': 720332.3582529258},
 ('AFG', 6): {'lower': 115899.20884721096, 'upper': 540581.276906233},
 ('MMR', 0): {'lower': 2939.1187065839754, 'upper': 71296.02452196219},
 ('MMR', 1): {'lower': 12648.23945945629, 'upper': 177379.83365212427},
 ('MMR', 2): {'lower': 66186.40997726563, 'upper': 231981.93505843563},
 ('MMR', 3): {'lower': 139632.8387488249, 'upper': 275585.3101372774},
 ('MMR', 4): {'lower': 195978.37924330475, 'upper': 281538.21813497896},
 ('MMR', 5): {'lower': 159372.50146062503, 'upper': 365527.7701653139},
 ('MMR', 6): {'lower': 114040.03350491042, 'upper': 385435.55818664486}}