from .base import Transformer
import os
import pandas as pd
import numpy as np
from datetime import datetime

ISO_COUNTRY_CODES = os.path.join(os.path.dirname(__file__), 'countrycodes.csv')

# Sub-Saharan country codes which are of interest for migration ORIGINS
SOURCES = ['Burundi', 'Comoros', 'Djibouti',
           'Eritrea', 'Ethiopia', 'French Southern Territories', 'Kenya', 'Madagascar',
           'Malawi', 'Mauritius', 'Mayotte', 'Mozambique', 'Réunion', 'Rwanda', 'Seychelles',
           'Somalia', 'South Sudan', 'United Republic of Tanzania', 'Uganda', 'Zambia', 'Zimbabwe']

# Destination of interest
DESTINATIONS = ['Italy', 'Sweden', 'Denmark', 'United Kingdom', 'Saudi Arabia', 'South Africa']


class TargetTransformer(Transformer):
    """
    Generates the target forecast variable for each destination cluster.

    Based on target forecast variable from ETH (Ethiopia) to the destination countries.
    However, since we use data migratory sources from other Sub-Saharan Countries as well,
    these are also encoded as the target variable.

    Specifically, the target variable 'TARGET.ETH.TO.EU' that denotes annual mixed migration
    flow from Ethiopia to Europe, will also have flows from Somalia to EU for a row with that
    country code.

    year,value,Country Name,Country Code,Indicator Name,Indicator Code
    1980,218.0,Ethiopia,ETH,Mixed Migration ETH to Europe,TARGET.ETH.TO.EU  ---> Flows form ETH to EU
    1981,376.0,Somalia,SOM,Mixed Migration ETH to Europe,TARGET.ETH.TO.EU  ---> Flows from SOM to EU

    """

    def __init__(self, source, target):
        super().__init__(source, target)
        self.iso = pd.read_csv(ISO_COUNTRY_CODES,
                               usecols=[0, 2],
                               names=['name', 'iso3'],
                               header=0)

        # Fix naming difference
        self.iso.at[self.iso.name == "United Kingdom of Great Britain and Northern Ireland", 'name'] = "United Kingdom"

    def read(self):
        """ Overloaded method, since we have multiple sources """

        self.unhcr = pd.read_csv(self.source[0],
                                 skiprows=4,
                                 na_values='*',
                                 names=['year', 'target', 'source', 'type', 'value'],
                                 dtype={'year': np.int32,
                                        'value': np.float})

        self.yemen = pd.read_csv(self.source[1])

        self.undesa = pd.read_excel(self.source[2],
                                    sheet_name='Table 1',
                                    header=15,
                                    skipfooter=26,
                                    na_values='..')

    def __interpolate(self):
        """ A linear interpolation for UNDESA data which is every 5 years """

        results = []
        base_years = set(np.arange(min(self.undesa.year), 2017, 1))

        for s in SOURCES:
            for d in DESTINATIONS:

                # fetch the time series for this pair
                c1 = self.undesa.target == d
                c2 = self.undesa.source == s

                # Assume that the UNDESA was consistent across years when
                # it considered Refugee numbers to be part of the migration stock
                R = any(self.undesa.loc[c1 & c2, 'R'])

                # A temporary frame to do the interpolation
                ts = pd.DataFrame({'target': d,
                                   'source': s,
                                   'R': R,
                                   'year': self.undesa.loc[c1 & c2, 'year'],
                                   'migration': self.undesa.loc[c1 & c2, 'migration']})

                if len(ts) >= 3:

                    # only consider country pairs with at least 3 observations

                    # years to interpolate
                    interyears = list(base_years - set(ts.year.unique()))
                    tr = pd.DataFrame({'target': [d for i in range(len(interyears))],
                                       'source': [s for i in range(len(interyears))],
                                       'R': [R for i in range(len(interyears))],
                                       'year': interyears,
                                       'migration': [np.nan for i in range(len(interyears))]
                                       })

                    ts = ts.append(tr, ignore_index=True)

                    # do the interpolation
                    ts.sort_values(by='year', inplace=True)
                    ts.set_index('year', inplace=True)
                    ts.migration.interpolate(inplace=True)

                    results.append(ts)

                else:
                    print("{} -> {} has {} observations. Ignoring".format(s, d, len(ts)))

        val = pd.concat(results)
        val.reset_index(inplace=True)
        return val

    def __undesa_transform(self):
        """ UNDESA data is for every 5 years, so we interpolate """

        # For some reason, there is a nan-index at the end when read in
        # so drop the last value
        self.undesa = self.undesa[:-1]

        print("UNDESA migration matrix with {} rows.".format(len(self.undesa)))

        # Excel reader doesn't read some of the headers
        self.undesa.index = self.undesa.index.set_names(["Year",
                                                         "Sort order",
                                                         "Destination",
                                                         "Notes",
                                                         "Code",
                                                         "Type of data"])

        # Remove the multi index for now - and treat them as columns
        self.undesa = self.undesa.reset_index()
        self.undesa.drop(columns=["Sort order",
                                  "Notes",
                                  "Code",
                                  "Total",
                                  "Other North",
                                  "Other South"], inplace=True)

        # Some of the UNDESA migration numbers include the UNHCR numbers
        # This is indicated by the code "R" in the "type of data"
        # To avoid duplication at generating the target variables,
        # we use "R" as a flag to mark specific entries that
        # include migration numbers

        self.undesa['R'] = self \
            .undesa['Type of data'] \
            .apply(lambda x: True if 'R' in str(x) else False)
        self.undesa.drop(columns=['Type of data'], inplace=True)

        # Transform from matrix to long form
        self.undesa = self.undesa.melt(id_vars=['Year', 'Destination', 'R'],
                                       var_name='source',
                                       value_name='migration')

        # conform to the other sources
        self.undesa.rename(columns={'Destination': 'target'}, inplace=True)
        self.undesa['year'] = self.undesa['Year'].astype(int)
        self.undesa.drop(columns=['Year'], inplace=True)
        self.undesa = self.undesa[['year', 'source', 'target', 'R', 'migration']]
        print("UNDESA long form data with {} rows.".format(len(self.undesa)))

        # Filter based on sources and destinations
        c1 = self.undesa.source.isin(SOURCES)
        c2 = self.undesa.target.isin(DESTINATIONS)
        self.undesa = self.undesa[c1 & c2]

        # Remove any nulls
        c3 = self.undesa.migration.isnull()
        self.undesa.migration[c3] = 0.0

        print("UNDESA data for SOURCE/DESTINATION countries with {} rows.".format(len(self.undesa)))

        # Handle interpolation (linear for now)
        self.undesa = self.__interpolate()

        # EDIT - after the Dublin workshop, August 2018
        # UNDESA stats are for migrant stock. We need to derive flows.
        # Using a simplifying assumption:
        #
        # flow(t) = stock(t) - stock (t-1)
        #
        # Note there are other methods like Abel et al. (2016), which may
        # be more accurate here.

        self.undesa['migration'] = self.undesa.groupby(['source', 'target'])['migration'].transform(self.__get_flows)

        c1 = self.undesa.migration.isnull()
        self.undesa = self.undesa[~c1]

    def __get_flows(self, x):
        """ Helper script to compute flows from migration stock """

        k = x.diff()
        k[k < 0] = 0  # flows of interest are positive
        return k

    def __unhcr_transformer(self):

        # Handle NA values
        print("UNHCR data with {} rows.".format(len(self.unhcr)))
        self.unhcr.replace([np.inf, -np.inf], np.nan)
        self.unhcr = self.unhcr[~pd.isnull(self.unhcr.value)]
        self.unhcr['value'] = self.unhcr['value'].astype(int)
        print("UNHCR data sans NA values has {} rows.".format(len(self.unhcr)))

        # Get the different populations in long form
        self.unhcr = self.unhcr.pivot_table(index=['year', 'source', 'target'],
                                            columns='type',
                                            values='value')

        self.unhcr.reset_index(level=['year', 'source', 'target'], inplace=True)

        # Filter based on sources and destinations
        c1 = self.unhcr.source.isin(SOURCES)
        c2 = self.unhcr.target.isin(DESTINATIONS)
        self.unhcr = self.unhcr[c1 & c2]

        self.unhcr.fillna(value=0, inplace=True)

        print("UNHCR data for SOURCE/DESTINATION countries with {} rows.".format(len(self.unhcr)))

    def __yemen_arrivals_transformer(self):
        """
        Yemeni arrivals data :
        UNHCR estimates for refugee/AS into Saudi Arabia are close
        to 0. Here we look at the DRC survey data on Yemeni arrivals
        The arrival numbers measured monthly for SOM (Somali) and
        Non-SOM (everybody else).

        DRC assumes that all Non-SOM flows recorded in Yemen are infact
        flows from Ethiopia to Saudi Arabia.

        The actual data has discontinuities around 2017. We previously
        used projections to address this (and were quite wrong in doing so)
        The revised approach is to manual input annual numbers from other
        sources (e.g. IOM).
        """

        # The two origin categories as considered by DRC
        categories = [('SOM', 'Somalia'), ('Non-SOM', 'Ethiopia')]

        self.yemen = pd.concat([pd.DataFrame({'year': self.yemen.Year,
                                              'DRCsurvey': self.yemen[lbl],
                                              'source': src,
                                              'target': 'Saudi Arabia'})
                                for (lbl, src) in categories], ignore_index=True)

    def transform(self):
        """ Transform each of the sources and merge """

        self.__undesa_transform()
        self.__unhcr_transformer()
        self.__yemen_arrivals_transformer()

        # Merge
        tmp = self.unhcr.merge(self.yemen,
                               how='outer',
                               on=['year', 'source', 'target'])

        data = tmp.merge(self.undesa,
                         how='outer',
                         on=['year', 'source', 'target'])

        data.fillna({'R': False}, inplace=True)
        data.fillna(value=0, inplace=True)

        # Here are all the populations of interest, i.e. contribute to
        # the target variable
        cols = ['migration',
                'DRCsurvey',
                'Refugees (incl. refugee-like situations)',
                'Returned refugees',
                'Others of concern',
                'Asylum-seekers']

        # Add all the populations
        data['total'] = data[cols].sum(axis=1)

        # For cases where UNDESA migration estimates already include
        # Refugee numbers from UNHCR, subtract the Refugee totals
        data.loc[data.R, 'total'] = data.loc[data.R, 'total'] \
            - data.loc[data.R, 'Refugees (incl. refugee-like situations)']

        # Drop all non-essential columns
        cols = ['migration',
                'DRCsurvey',
                'Refugees (incl. refugee-like situations)',
                'Returned refugees',
                'Others of concern',
                'Asylum-seekers',
                'Internally displaced persons',
                'Returned IDPs',
                'Stateless persons',
                'R']

        data.drop(columns=cols, inplace=True)
        data.rename(columns={'total': 'value'}, inplace=True)

        # Assign indicator codes based on destination
        data = data.merge(self.iso, how='left', left_on='source', right_on='name')
        data.rename(columns={'source': 'Country Name', 'iso3': 'Country Code'}, inplace=True)
        data.drop(columns=['name'], inplace=True)

        # Get country codes for the sources
        data = data.merge(self.iso, how='left', left_on='target', right_on='name')
        data['Indicator Name'] = "Mixed migration to " + data['target']
        data['Indicator Code'] = "ETH.TO." + data['iso3']
        data.drop(columns=['name', 'iso3', 'target'], inplace=True)

        self.df = data
