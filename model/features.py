import pandas as pd
from time import time
import logging
import os
import json
import numpy as np

from statsmodels.tsa.ar_model import AR

logger = logging.getLogger(__name__)


# Set of variables to predict
TARGETS = ['ETH.TO.SAU', 'ETH.TO.ITA', 'ETH.TO.GBR',
           'ETH.TO.DNK', 'ETH.TO.SWE', 'ETH.TO.ZAF']

# Sub-Saharan countries codes
SSA = ['BDI', 'COM', 'DJI', 'ERI', 'ETH', 'ATF', 'KEN', 'MDG', 'MWI',
       'MUS', 'MYT', 'MOZ', 'REU', 'RWA', 'SYC', 'SOM', 'SSD', 'TZA',
       'UGA', 'ZMB', 'ZWE']

# User facing labels
LABELS = ['worse', 'poor', 'average', 'good', 'best']

# Maximum number of lag variables to consider for projections
MAX_LAG = 3


class Generator(object):
    """ Feature generation routine for scoring """

    def __init__(self, config, groupings, baseyear):
        """ Initialize with a configuration object and the indicator groupings """

        start_time = time()
        sources = [os.path.join(os.getcwd(), config['paths']['output'],
                                d['name'],
                                'data.csv') for d in config['sources']]

        # Generate a data frame with all indicators
        self.df = pd.concat((pd.read_csv(f)
                             for f in sources), sort=False, ignore_index=True)
        #self.df.year = self.df.year.fillna(method="ffill")
        #self.df.year = self.df.year.astype(int)
        # Summary stats
        logger.info("Sources            : {}".format(len(sources)))
        logger.info("Row count          : {}".format(len(self.df)))
        logger.info("Geographies        : {}".format(len(self.df['Country Name'].unique())))
        logger.info("Indicators         : {}".format(len(self.df['Indicator Code'].unique())))
        logger.info("Temporal coverage  : {} -> {}".format(self.df.year.min(), self.df.year.max()))
        logger.info("Null values        : {}".format(sum(self.df['value'].isnull())))

        logger.info("Loaded data in {:3.2f} sec.".format(time() - start_time))

        # Do the projections for indicators of interest
        logger.info("Projecting indicators to {}.".format(baseyear))
        inds = list(set(self.df['Indicator Code'].unique()) - set(TARGETS + ['Country Code', 'year']))
        #proj = self.__projections(inds, baseyear)

        # persist projections
        # self.df['type'] = "raw"
        # proj['type'] = 'projected'

        # Include projections with the raw data
#        self.df = pd.concat([self.df, proj], sort=False)



        # self.df.to_csv("projections.csv", index=False)

        # Now arrange data in long form
        self.data = pd.pivot_table(self.df, index=['Country Code', 'year'],
                                   columns='Indicator Code', values='value')

        # Consider country/year as features (and not an index)
        self.data.reset_index(inplace=True)

        # These are the set of indicators to consider
        self.indicators = sorted(list(set(self.data.columns) - set(TARGETS + ['Country Code', 'year'])))

        # Get the set of indicators/code mappings
        self.labels = {i[0]: i[1]
                       for i in self.df[['Indicator Code', 'Indicator Name']].drop_duplicates().values.tolist()}

        # Filter by Sub-Saharan African countries for generating quantile cuts
        ssa_data = self.data[self.data['Country Code'].isin(SSA)]

        # Indicators that we use for Scenarios and their relative improvements
        INDICATORS = {i['code']: i['direction-improvement'] for grp in groupings['clusters'] for i in grp['indicators']}

        # Get the label <-> numeric transformers set up
        self.category_lookup = {}
        self.indicator_bins = {}

        for ind, order in INDICATORS.items():
            if order == "higher":
                lbl = LABELS
            else:
                lbl = list(reversed(LABELS))

            tmp, bins = self.__generate_lookup(ssa_data[ind], lbl)
            self.category_lookup.update(tmp)
            self.indicator_bins[ind] = (bins, lbl)

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
        #print(pdf.year)
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

                    pred = model_fit.predict(start=str(years.min())[:4], end=str(years.max())[:4])
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

    def fetch(self, targetvar, baseyear, featureset):
        """
        Generate a feature set for a target variable (targetvar) for a base year.
        The input feature set will be for the previous year.
        """

        assert targetvar in TARGETS, "Forecasts for {} target are not support.".format(targetvar)

        source, _, destination = targetvar.split(".")

        data = self.data.copy(deep=True)

        dcols = data.columns
        for fv in self.indicators:
            assert fv in dcols,\
                "Feature variable '{}' does not exist.".format(fv)

        true_feature_var = [f for f in self.indicators]

        # Temporal filter
        v1 = data.year == baseyear

        # Spatial filter
        v2 = data['Country Code'] == source

        # Variable additions
        if "DUMMY" in featureset:

            # Generate one hot encodings of the country labels
            tmp = pd.get_dummies(data['Country Code'])

            data = pd.concat([data, tmp], axis=1)

            # Include dummy variables in the feature_set
            # if we have data for them and they are for Sub-Saharan Africa
            true_feature_var += [s for s in SSA if s in tmp.columns]

        if "AR" in featureset:

            # For an AR(1) we just include current year value
            true_feature_var += [targetvar]

        if "DEST" in featureset:
            # Include feature set from destination country
            idx = data['Country Code'] == destination
            d_df = data.loc[idx, ['year'] + self.indicators].copy(deep=True)
            data = pd.merge(data, d_df, on='year', suffixes=('', '.DEST'), how='left')
            true_feature_var += [v + ".DEST" for v in self.indicators]
            # logger.info("Destination features")
            # logger.info("Total # Features: {}".format(len(true_feature_var)))

        if "TLAG" in featureset:
            # Include temporal lag features
            data, varname = self.__lag_variables(data, self.indicators, -1)
            true_feature_var += varname

        # Pull it all together
        Xv = data.loc[v1 & v2, true_feature_var]

        return Xv
