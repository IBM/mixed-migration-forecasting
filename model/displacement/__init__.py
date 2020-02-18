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
# level projection using an AR model. The projection is this included
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
CI_LOOKUP = {('AFG', 0): {'lower': 5.665219699343046e-05, 'upper': 0.0001889530879755815},
 ('AFG', 1): {'lower': 96941.94317469536, 'upper': 391701.3087687436},
 ('AFG', 2): {'lower': 70886.55776713863, 'upper': 511274.55076823005},
 ('AFG', 3): {'lower': 302342.9467569618, 'upper': 1047273.0196963713},
 ('AFG', 4): {'lower': 83635.7922783768, 'upper': 625348.5347889329},
 ('AFG', 5): {'lower': 94393.85366714257, 'upper': 233173.67421005908},
 ('AFG', 6): {'lower': 228579.76717816075, 'upper': 756210.2841820027},
 ('MMR', 0): {'lower': 7.362287093807633e-05, 'upper': 0.0006437247308592001},
 ('MMR', 1): {'lower': 20180.67174192898, 'upper': 154056.17746027187},
 ('MMR', 2): {'lower': 58416.27593719851, 'upper': 235484.84038550747},
 ('MMR', 3): {'lower': 199513.05857889878, 'upper': 313093.3757420884},
 ('MMR', 4): {'lower': 161987.04375370123, 'upper': 268034.8947075358},
 ('MMR', 5): {'lower': 134434.82442245784, 'upper': 334274.76533757104},
 ('MMR', 6): {'lower': 87810.55039265723, 'upper': 350986.925064245}}
