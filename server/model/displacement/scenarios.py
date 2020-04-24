"""
Wrappers for the OLS models that do elasticity estimation
"""

import statsmodels.api as sm
from . import *
import json
import pandas as pd
from typing import Dict, List
from itertools import product
import logging
import numpy as np

logger = logging.getLogger(__name__)


class Scenario(object):

    def __init__(self, data, config):
        self.data = data
        self.config = config
        self.COUNTRIES = config['supported-countries']['displacement'] + ['subglobal']

        groupings = json.load(open(config['GROUPING'], 'rt'))
        self.featureset = [i['code']
                           for c in groupings['clusters'] for i in c['indicators']]
        self.CLUSTERS = groupings['clusters']
        self.THEMES = [c['theme'] for c in self.CLUSTERS]
        self.LABELS = {t['theme']: t['labels'] for t in groupings['clusters']}
        self.theme_indicator_map = {c['theme']: c['indicators'] for c in self.CLUSTERS}

        self.train()

    def train(self):
        """ Cook OLS models """

        logger.info("Estimating elasticities for scenario models.")
        self.models = {}

        for lag, c in product(SCENARIO_LAGS, self.COUNTRIES):

            logger.info("Lag: {} Country: {}".format(lag, c))

            if c == 'subglobal':
                X, Y = self.model_case(lag, subglobal)
            else:
                X, Y = self.model_case(lag, c)

            X1 = sm.add_constant(X.values)

            M = {}
            key = c, lag
            clf = sm.OLS(Y, X1)
            m = clf.fit()
            M['significance'] = (m.pvalues < 0.05).to_dict()
            M['elasticity'] = m.params.to_dict()
            M['model'] = m
            self.models[key] = M


    def get_significance(self, issignificant, indicators):
        """
        Summarize statistical significance
        issignificant - boolean vector of significant pvalues
        """ 
    
        c = [i['code'] for i in indicators]
        s = [issignificant[i] for i in c]

        if all(s):
            # Statistically significant for entire cluster
            return "*"

        elif any(s):
            # only some indicators within cluster are statistically significant
            return "x"

        else:
            # Not statistically significant
            return "ns"
    

    def compute_target_change(self, Xv:pd.DataFrame, scenario: Dict, country: str):
        """
        Compute change of target variable relative to a 
        user-specified scenario.
        Xv is the scoring instance
        
        returns percentage change in displacement if it is
        statistically significant.
        """

        # Validate inputs
        try:
            Xv = Xv.loc[:, self.featureset]

        except KeyError:
            missingcols = [c for c in self.featureset if ~(c in Xv.columns)]
            logger.error("Scoring instance does not have:{}".format(missingcols))
            raise KeyError

        for k, v in scenario.items():
            assert k in self.THEMES, "Theme: {} is not supported".format(k)
            assert v in self.LABELS[k], "Change label {} not supported for theme {}.".format(v, k)
        
        # Transform from clusters
        # to indicator-level scenario that accounts for the 
        # direction of the indicator.
        user_indicators = {}
        user_themes = list(scenario.keys())

        for theme, change in scenario.items():

            # get the percentage change set
            try:
                ds = float(change.replace('%', '')) / 100.0
            except ValueError:
                if not 'NC' in change:
                    logger.warn("Could not coerce {} to numeric value. Assuming no change.".format(change))
                ds = 0.0

            indicatorset = self.theme_indicator_map[theme]
            
            for i in indicatorset:
                if i['direction-improvement'] == 'lower':
                    # flip the direction
                    user_indicators[i['code']] = -1 * ds
                else:
                    user_indicators[i['code']] =  ds

        # numerical change sought by user
        num_change = {k: v * np.abs(Xv[k].values[0]) for k, v in user_indicators.items()}

        # finally - apply elasticities
        resultset = {}
        for lg in SCENARIO_LAGS:
            key = country, lg
            
            # get the country specific elasticities
            e = self.models[key]['elasticity']
            sig = self.models[key]['significance']

            # the fall back elasticities (assumed to be significant)
            e_fb = self.models[('subglobal', lg)]['elasticities']

            # Check which elasticities to use. Significance is looked at
            # at the cluster/theme level. 
            country_e = []
            baseline_e = []

            theme_sig_report = {}
            for theme in user_themes:

                indicatorset = self.theme_indicator_map[theme]
                theme_sig_report[theme] = self.get_significance(sig, indicatorset)

                if theme_sig_report[theme] == 'ns':
                    # Not significant, so use the baseline for this indicator set
                    baseline_e.append(indicatorset)
                else:
                    country_e.append(indicatorset)

            # Finally compute the revised forecast
            total_change = 0.0
            for k, v in num_change.items():
                if k in baseline_e:
                    total_change += e_fb[k] * v
                elif k in country_e:
                    total_change += e[k] * v

            resultset[key] = {'change': total_change,
                           'significance': self.__report(theme_sig_report) }
        
        return resultset

    def __report(self, s):
        """
        Helper function to generate user-facing statements 
        on significance 
        """
        alls = [k for k, v in s.items() if v == '*']
        soms = [k for k, v in s.items() if v == 'x']
        nots = [k for k, v in s.items() if v == 'ns']

        stmt = ""
        if alls:
            stmt += "Estimated change in clusters {} is statistically significant.".format(", ".join(alls))
        
        if soms:
            stmt += "Only some indicators in clusters {} is statistically significant.".format(", ".join(soms))
        
        if nots:
            stmt += "Changes estimated for clusters {} is NOT statistically significant.".format(", ".join(nots))

        return stmt

    def model_case(self, lag, countries):
        """ Generate a data frame to estimate elasticities """

        # spatial filter
        if not isinstance(countries, list):
            countries = [countries]
        c1 = self.data['Country Code'].isin(countries)

        # temporal filter
        c2 = self.data.year >= MIN_OLS_YEAR
        df = self.data.loc[c1 & c2, FE_IDX + self.featureset + TARGETS]

        if lag != 0:
            df, true_target = self.__lag_variables(df, TARGETS, lag)
        else:
            df = self.data.copy(deep=True)
            true_target = TARGETS

        X = df.loc[:, self.featureset]
        Y = df.loc[:, true_target]

        # omit missing labels
        idx = ~pd.isnull(Y.values)
        Y = Y[idx]
        X = X[idx]

        # Missing data
        X.fillna(X.mean(), inplace=True)
        Y.fillna(Y.mean(), inplace=True)

        return X, Y

    def __lag_variables(self, data, var, lag):
        """
        Append lagged variables to a frame.

        var - list of variable names to lag
        lag - integer (years to lag the variables by)

        Returns a DataFrame and the list of new column names
        """

        idx_cols = ['year', 'Country Code']
        fv = var + idx_cols

        tmp = data[fv].copy(deep=True)

        col_name = [v + ".T" + "{0:+}".format(lag) for v in var]
        tmp.rename(columns={k: v for (k, v) in zip(
            var, col_name)}, inplace=True)
        tmp.year -= lag
        data = pd.merge(data, tmp, on=idx_cols, how='left')

        return data, col_name
