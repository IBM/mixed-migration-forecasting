from .base import Transformer
import pandas as pd
import numpy as np
import os

ISO_COUNTRY_CODES = os.path.join(os.path.dirname(__file__), 'countrycodes.csv')


class UnhcrTransformer(Transformer):
    """ UNHCR Migration data transformer """

    def __init__(self, source, target):
        super().__init__(source, target)
        self.iso = pd.read_csv(ISO_COUNTRY_CODES,
                               usecols=[0, 2],
                               names=['name', 'iso3'],
                               header=0)

        # UNHCR codes for various populations
        self.codes = {
            'Refugees (incl. refugee-like situations)': 'UNHCR.OUT.REF',
            # 'Returnees': 'UNHCR.OUT.RET', # Changes in data from 2016 -> 2017
            'Returned refugees': 'UNHCR.OUT.RET',
            'Internally displaced persons': 'UNHCR.OUT.IDP',
            'Returned IDPs': 'UNHCR.OUT.RETIDP',
            'Others of concern': 'UNHCR.OUT.OOC',
            'Asylum-seekers': 'UNHCR.OUT.AS',
            # 'Stateless': 'UNHCR.OUT.STLS' # Changes in data from 2016 -> 2017
            'Stateless persons': 'UNHCR.OUT.STLS'
        }

    def read(self):
        self.df = pd.read_csv(self.source,
                              skiprows=4,
                              na_values='*',
                              names=['year', 'target', 'source', 'type', 'value'],
                              dtype={'year': np.int32,
                                     'value': np.float})

        # print("Data has {} rows.".format(len(self.df)))

        # Handle NA values
        self.df.replace([np.inf, -np.inf], np.nan)
        self.df = self.df[~pd.isnull(self.df.value)]
        self.df['value'] = self.df['value'].astype(int)
        # print("Data sans NA values has {} rows.".format(len(self.df)))

    def __indicator_code(self, x):
        return self.codes[x]

    def transform(self):
        """
        UNHCR data is a matrix of bilateral flows of various types.
        This transforms this matrix to aggregated outflow of populations
        per year.
        """

        # Get the ISO codes for country destinations ("target")
        td = pd.merge(self.df, self.iso, how='left', left_on='target', right_on='name')
        td.rename(columns={'iso3': 'target_iso3'}, inplace=True)
        td.drop(['name'], axis=1, inplace=True)

        # ISO 3 codes for source countries
        td = pd.merge(td, self.iso, how='left', left_on='source', right_on='name')
        td.rename(columns={'iso3': 'source_iso3'}, inplace=True)
        td.drop(['name'], axis=1, inplace=True)

        # outflows by source country
        outflows = td.groupby(['year',
                               'source',
                               'source_iso3',
                               'type'], as_index=False).agg(np.sum)

        outflows = outflows[~pd.isnull(outflows.value)]
        outflows.rename(columns={'source': 'Country Name',
                                 'source_iso3': 'Country Code',
                                 'type': 'Indicator Name'}, inplace=True)

        outflows['Indicator Code'] = outflows['Indicator Name'].apply(self.__indicator_code)

        # rearrange columns to be consistent
        outflows = outflows.reindex(columns=['Country Name',
                                             'Country Code',
                                             'Indicator Name',
                                             'Indicator Code',
                                             'year',
                                             'value'])

        # Persist to class attribute (for writes)
        self.df = outflows
