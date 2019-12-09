import pandas as pd
from time import time
import logging
import os
import json
import numpy as np

from statsmodels.tsa.ar_model import AR

logger = logging.getLogger(__name__)


# Set of variables to predict
TARGETS = ['TARGET']

# User facing labels
LABELS = ['worse', 'poor', 'average', 'good', 'best']

# Maximum number of lag variables to consider for projections
MAX_LAG = 3


class Generator(object):
    """ Feature generation routine for scoring """

    def __init__(self, config,  baseyear):
        """ Initialize with a configuration object and the indicator groupings """

        """ Get the data from static assets """

        start_time = time()

        sources = [os.path.join(os.path.dirname(__file__), "..", config['paths']['output'],
                                d['name'],
                                'data.csv') for d in config['sources']]

        # Generate a data frame with all indicators
        self.df = pd.concat((pd.read_csv(f)
                        for f in sources), sort=False, ignore_index=True)

        # Summary stats
        logger.info("Sources            : {}".format(len(sources)))
        logger.info("Row count          : {}".format(len(self.df)))
        logger.info("Geographies        : {}".format(len(self.df['Country Name'].unique())))
        logger.info("Indicators         : {}".format(len(self.df['Indicator Code'].unique())))
        logger.info("Temporal coverage  : {} -> {}".format(self.df.year.min(), self.df.year.max()))
        logger.info("Null values        : {}".format(sum(self.df['value'].isnull())))

        logger.info("Loaded data in {:3.2f} sec.".format(time() - start_time))

        # Now arrange data in long form
        self.data = pd.pivot_table(self.df, index=['Country Code', 'year'],
                              columns='Indicator Code', values='value')

        # Consider country/year as features (and not an index)
        self.data.reset_index(inplace=True)

        self.data = self.data.fillna(method='ffill').fillna(method='bfill')

        #print(self.data.columns)

        # Get the set of indicators/code mappings
        self.labels = {i[0]: i[1]
                       for i in self.df[['Indicator Code', 'Indicator Name']].drop_duplicates().values.tolist()}
        countries = ['AFG', 'MMR']

        # Features
        idx = ['Country Code', 'year']
        mm = ['ETH.TO.{}'.format(i) for i in ['DNK', 'GBR', 'ITA', 'SAU', 'SWE', 'ZAF']]
        endo = ['UNHCR.OUT.AS', 'UNHCR.OUT.IDP', 'UNHCR.OUT.OOC',
                'UNHCR.OUT.REF', 'UNHCR.OUT.RET', 'UNHCR.OUT.RETIDP']
        # missing entirely
        emdat = ['EMDAT.CPX.OCCURRENCE', 'EMDAT.CPX.TOTAL.DEATHS', 'EMDAT.CPX.TOTAL.AFFECTED', 'EMDAT.CPX.AFFECTED']
        target = ['IDP', 'UNHCR.EDP']
        features = list(set(self.data.columns.tolist()) - set(idx + mm + endo + target + emdat))

        # filter
        c1 = self.data['Country Code'].isin(countries)
        c2 = self.data.year >= 1950

        self.df = self.data.loc[c1 & c2, idx + features + target]
        self.df['TARGET'] = self.df['IDP'] + self.df['UNHCR.EDP']

        # These are the set of indicators to consider
        t_var = ['TARGET']

        # Indicators that can serve as features
        self.indicators = list(set(self.df.columns.tolist()) - set(idx + mm + endo + target + emdat))







    def __projections(self, indicators, baseyear):
        """
        Generates indicator level projections till current year.

        This treats each indicator for each country as a time series. The
        projections are made using an AR(n) model, where n is determined by
        a heuristic approach (n here is the number of lag variables).

        For cases where data is insufficient, we simply treat it as missing
        which is better than projecting incorrectly.

        indicators: all indicators to project
        baseyear: year to project to.

        returns: a dataframe
        """
        start_time = time()

        pdf = self.df.copy(deep=True)
        pdf['year_idx'] = pd.to_datetime(pdf.year, format='%Y')
        pdf = pdf.set_index('year_idx').to_period(freq='Y')

        cnt = 0
        ign = 0

        # The resulting dataframe
        proj_df = pd.DataFrame()

        ts = pdf.groupby(['Country Code', 'Indicator Code'])

        for (country, ind), grp in ts:

            if (country in SSA) & (ind in indicators):

                # Years for which projection is needed
                years = np.arange(grp.year.max() + 1, baseyear + 1)

                # observations available in this time series
                obs = len(grp)

                # Maximum lag to consider for the AR model
                lag = min(len(grp) - 1, MAX_LAG)

                logger.debug("Country: {}, Indicator: {}, observations: {}, maxlag: {}, num years to project: {}".
                             format(country, ind, obs, lag, len(years)))

                if (years.size > 0) & (years.size <= 5) & (obs > 5):

                    # Do some interpolation if needed
                    X = grp.value.copy(deep=True)
                    X = X.resample('Y').sum()
                    X = X.interpolate()

                    # Fit and score an AR(n) model
                    model = AR(X, missing='raise')
                    model_fit = model.fit(maxlag=lag, trend='nc')

                    pred = model_fit.predict(start=str(years.min()), end=str(years.max()))
                    cnt += 1

                    # Conform to the overall dataframe
                    curr_df = pd.DataFrame()
                    curr_df['value'] = pred
                    curr_df['Country Code'] = country
                    curr_df['Indicator Code'] = ind
                    curr_df['Country Name'] = grp['Country Name'][0]
                    curr_df['Indicator Name'] = grp['Indicator Name'][0]
                    curr_df.reset_index(inplace=True)
                    curr_df.rename(columns={'index': "year"}, inplace=True)
                    curr_df = curr_df[['Country Name', 'Country Code',
                                       'Indicator Name', 'Indicator Code', 'year', 'value']]

                    proj_df = pd.concat([proj_df, curr_df], ignore_index=True)

                else:
                    # Don't do projections if relatively recent data isn't available
                    # or isn't needed.
                    # print("long time series")
                    ign += 1

            else:
                # No projections needed for countries outside Sub-Saharan Africa
                pass

        logger.info("Projections made for {} time series ({} ignored or not needed).".format(cnt, ign))
        logger.info("Projections made in {:3.2f} sec.".format(time() - start_time))

        # Change the year from period to integer
        proj_df.year = proj_df.year.apply(lambda x: int(x.strftime("%Y")))

        return proj_df

    def value_to_category(self, ind, val):
        """ Converts a numeric value to a user facing category """

        if np.isnan(val):
            return 'nan'

        if not self.indicator_exists(ind):
            raise ValueError("Indicator {} does not exist.".format(ind))

        if ind not in self.indicator_bins.keys():
            raise ValueError("Indicator {} does not exist in the indicator clusters".format(ind))

        # Get the bins/labels
        ind_b, ind_l = self.indicator_bins[ind]

        # Handle out of bounds cases
        if val <= ind_b[0]:
            return ind_l[0]
        elif val >= ind_b[-1]:
            return ind_l[-1]
        else:
            return ind_l[np.digitize(val, ind_b)-1]

    def category_to_value(self, ind, cat):
        """ Converts a user-facing category to numeric value """

        if not self.indicator_exists(ind):
            raise ValueError("Indicator {} does not exist.".format(ind))

        if cat not in LABELS:
            raise ValueError("Category {} is not defined.".format(cat))

        try:
            return self.category_lookup[(ind, cat)]

        except KeyError:
            raise ValueError("Does the indicator {} exist in the clusters of interest?".format(ind))

    def __generate_lookup(self, x, labels):
        """ Discretize indicators """

        # Quantile discretization of 5 classes for all other numeric quantities
        try:
            # logger.debug("Column: {}".format(x.name))
            _, bins = pd.qcut(x, 5, labels=labels, retbins=True, duplicates='drop')

        except ValueError:

            # Resort to ranking if data is sparse
            # WARNING: Same values will be discretized to separate bins
            try:
                # logger.debug("Column: {} +++ Ranked bins".format(x.name))
                _, bins = pd.qcut(x.rank(method='first'), 5, retbins=True,
                                  labels=labels, duplicates='drop')

            except ValueError:
                # logger.info("Column: {} ------------- ERROR.".format(x.name))
                return {}, []

        # Assign the bin centers as the value
        mids = [(a + b) / 2 for a, b in zip(bins[:-1], bins[1:])]
        return {(x.name, lbl): v for (v, lbl) in zip(mids, labels)}, bins

    def indicator_exists(self, v):
        """ Check if an indicator code exists """
        return v in self.labels.keys()

    def indicator_description(self, v):
        """ Get a text description of the indicator """
        try:
            return self.labels[v]
        except KeyError:
            logger.error("Indicator {} does not exist.".format(v))
            return None

    def indicator_value(self, ind, country, year):
        """ Get a specific indicator value """

        if not self.indicator_exists(ind):
            raise ValueError("Indicator code {} does not exist.".format(ind))

        # TODO: validity checks
        c1 = self.data['Country Code'] == country
        c2 = self.data['year'] == year

        return self.data[ind][c1 & c2].values[0]

    def __lag_variables(self, data, var, lag):
        """
        Append lagged variables to frame.

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

    def fetch(self, baseyear, country):
        """
        Generate a feature set for a target variable (targetvar) for a base year.
        The input feature set will be for the previous year.
        """



        data = self.df.copy(deep=True)

        dcols = data.columns


        true_feature_var = [f for f in self.indicators]


        # Temporal filter
        v1 = data.year == baseyear



        #print(true_feature_var)
        #print(self.v1.columns)
        # Pull it all together
        v2 = data['Country Code'] == country
        Xv = data.loc[v1 & v2, true_feature_var]

        return Xv
