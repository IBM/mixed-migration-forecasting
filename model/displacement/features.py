from . import *
import pandas as pd
from time import time
import logging
import os
import json
import numpy as np

from statsmodels.tsa.ar_model import AR

logger = logging.getLogger(__name__)


class Generator(object):
    """
    Data assembly and feature generation routines for training and scoring.
    
    Does:
    1. Loads data from the configuration object `config`
    2. Applies some filters and then makes projections for indicators
    3. Assembles data for training or scoring.
    4. TODO: Scenario conversions from user-labels to indicator values
    """

    def __init__(self, config, baseyear):
        """ 
        Get the data from static assets described in `config` object.
        `baseyear` is the current year for which the feature set is determined.
        """

        self.baseyear = baseyear

        start_time = time()

        sources = [os.path.join(os.path.dirname(__file__),
                                "..", "..", config['paths']['output'],
                                d['name'],
                                'data.csv') for d in config['sources']]

        # Generate a data frame with all the raw data
        self.raw = pd.concat((pd.read_csv(f)
                             for f in sources), sort=False, ignore_index=True)

        # Summary stats
        logger.info("Sources            : {}".format(len(sources)))
        logger.info("Row count          : {}".format(len(self.raw)))
        logger.info("Geographies        : {}".format(
            len(self.raw['Country Name'].unique())))
        logger.info("Indicators         : {}".format(
            len(self.raw['Indicator Code'].unique())))
        logger.info(
            "Temporal coverage  : {} -> {}".format(self.raw.year.min(), self.raw.year.max()))
        logger.info("Null values        : {}".format(
            sum(self.raw['value'].isnull())))

        logger.info("Loaded data in {:3.2f} sec.".format(time() - start_time))

        # Now arrange data in long form
        self.data = pd.pivot_table(self.raw, index=['Country Code', 'year'],
                                   columns='Indicator Code', values='value')

        # Consider country/year as features (and not an index)
        self.data.reset_index(inplace=True)

        # Get the set of indicators/code mappings
        self.labels = {i[0]: i[1]
                       for i in (self
                                 .raw[['Indicator Code', 'Indicator Name']]
                                 .drop_duplicates()
                                 .values
                                 .tolist())}

        # Indicators in the data. This a a country specific feature set
        self.indicators = feature_sets(self.data.columns.tolist())

        # filter down to the countries we are interested in.
        c1 = self.data['Country Code'].isin(COUNTRIES)
        c2 = self.data.year >= MIN_YEAR

        # References to raw and subset of the data
        # self.df_raw = self.df.copy(deep=True)
        self.df = self.data.loc[c1 & c2, FE_IDX + self.indicators['all'] + TARGETS]

        # make projections to handle data gaps
        tmp = pd.concat([self.raw, self.__projections()], sort=False)
        self.proj_df = pd.pivot_table(tmp, index=['Country Code', 'year'],
                                   columns='Indicator Code', values='value')
        self.proj_df.reset_index(inplace=True)

    def __projections(self):
        """
        Generates indicator level projections till base year.

        This treats each indicator for each country as a time series. The
        projections are made using an AR(n) model, where n is determined by
        a heuristic approach (n here is the number of lag variables).

        For cases where data is insufficient, we simply treat it as missing
        which is better than projecting incorrectly.

        indicators: all indicators to project
        baseyear: year to project to.

        returns: a dataframe in long form

        Note:
        - also contains the 
        """

        start_time = time()

        pdf = self.raw.copy(deep=True)
        pdf = pdf[pdf['Country Code'].isin(COUNTRIES)]
        pdf['year_idx'] = pd.to_datetime(pdf.year, format='%Y')
        pdf = pdf.set_index('year_idx').to_period(freq='Y')

        cnt = 0
        ign = 0

        # The resulting dataframe
        proj_df = pd.DataFrame()

        ts = pdf.groupby(['Country Code', 'Indicator Code'])

        for (country, ind), grp in ts:

            if (ind in self.indicators[country] + TARGETS):

                # Years for which projection is needed
                # `stop` has a +1 since the interval does not include the specified value
                years = np.arange(start=grp.year.max() + 1,
                                  stop=self.baseyear + 1)

                # observations available in this time series
                obs = len(grp)

                # Maximum lag to consider for the AR model
                lag = min(len(grp) - 1, PROJECTION_MAX_LAGS)

                logger.debug("Country: {}, Indicator: {}, observations: {}, maxlag: {}, num years to project: {}".
                             format(country, ind, obs, lag, len(years)))

                if (years.size > 0) & (years.size <= 5) & (obs > 5):

                    # Do some interpolation if needed
                    X = grp.value.copy(deep=True)
                    X = X.loc[~X.index.duplicated(keep='first')]
                    X = X.resample('Y').sum()
                    X = X.interpolate()
                    X.dropna(inplace=True)

                    # Fit and score an AR(n) model
                    model = AR(X, missing='raise')
                    model_fit = model.fit(maxlag=lag, trend='nc')

                    
                    pred = model_fit.predict(
                            start=str(years.min()), end=str(years.max()))
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
                    # Don't do projections if relatively recent data isn't available, or too
                    # few observations, or if its not needed
                    ign += 1

            else:
                # No projections needed for this indicators
                pass

        logger.info(
            "Projections made for {} time series ({} ignored or not needed).".format(cnt, ign))
        logger.info("Projections made in {:3.2f} sec.".format(
            time() - start_time))

        # Change the year from period to integer
        proj_df.year = proj_df.year.apply(lambda x: int(x.strftime("%Y")))

        return proj_df

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

        c1 = self.data['Country Code'] == country
        c2 = self.data['year'] == year

        return self.data[ind][c1 & c2].values[0]

    @staticmethod
    def get_diff(fr):
        """ Helper function to compute diffs """
    
        fr = fr.sort_values(by='year')
        tmp = fr.year
        res = fr.diff()
        res['year'] = tmp
        res.fillna(-10^9, inplace=True)
        return res


    def features(self,
                 country,
                 forecast_year,
                 method='scoring',
                 differencing=False):
        """
        Generate features for training/scoring.

        :param str country: ISO-3 code for country
        :param int forecast_year: year for which this feature set is being assembled
        :param str method: feature set for training/scoring (default)
        :param bool differencing: feature/targets are differences or not (default: no differencing)

        :returns dict: dataframes for scoring/training

        Notes:
        - We use the projected dataframe for feature generation.

        """

        assert method in ['scoring', 'training'], \
            "{} isn't a valid method ('scoring'/'training' are).".format(method)

        dt = forecast_year - self.baseyear

        # build the changes feature set
        if differencing:
            idx = self.proj_df['Country Code'] == country
            data = self.proj_df[idx].groupby(['Country Code']).apply(self.get_diff)
            data = data.reset_index()

            # For changes, we need to anchor the changes. Here
            # we select the baseyear value.
            t1 = self.proj_df.year == self.baseyear
            bv = self.proj_df.loc[idx & t1, TARGETS[0]].values[0]

        else:
            data = self.proj_df.copy(deep=True)
            bv = None

        # Target variable offset by a year (y_(t+dt))
        data, varname = self.__lag_variables(data, TARGETS, dt)
        true_target_var = varname[0]

        # Include current year target as a feature
        true_feature_var = self.indicators[country] + TARGETS

        # Handle the missing features
        data = (data
                .fillna(method='ffill')
                .fillna(method='bfill'))

        # Temporal filters
        t1 = data.year == self.baseyear

        # Spatial filter
        s1 = data['Country Code'] == country

        if method == 'training':
            Xt = data.loc[s1, true_feature_var]
            yt = data.loc[s1, true_target_var]
            Xv = None

            # Drop missing training labels
            idx = ~pd.isnull(yt)
            yt = yt[idx]
            Xt = Xt[idx]

        elif method == 'scoring':

            Xt = None
            yt = None
            Xv = data.loc[t1 & s1, true_feature_var]

        
        return {'data': (Xt, yt, Xv), 
                'Country code': country, 
                'baseyear': self.baseyear,
                'baseline': bv}
    

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
