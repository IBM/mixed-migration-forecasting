from .base import Transformer
import pandas as pd
import numpy as np
import os

ISO_COUNTRY_CODES = os.path.join(os.path.dirname(__file__), 'countrycodes.csv')

# Test comment

class ACLEDTransformer(Transformer):

    def __init__(self, source, target):
        super().__init__(source, target)
        self.iso = pd.read_csv(ISO_COUNTRY_CODES,
                               usecols=[0, 2],
                               names=['name', 'iso3'],
                               header=0)

        self.codes = {'ACLED.COUNT': 'ACLED total number of violent incidents annually.',
                      'ACLED.FATALITIES': 'ACLED number of fatalities annually from violence.'}

    def __indicator_names(self, x):
        return self.codes[x]

    def read(self):
        self.df = pd.read_csv(self.source,
                              usecols=['year', 'iso3', 'fatalities'])

    def transform(self):
        """ ACLED Transforms to give two indicators (counts/fatalities) """

        # Generate the indicators on an annual basis
        self.df = self.df.groupby(['year', 'iso3'], as_index=False).agg(['count', 'sum']).reset_index()
        self.df.columns = self.df.columns.get_level_values(level=0)
        self.df.columns = ['year', 'iso3', 'ACLED.COUNT', 'ACLED.FATALITIES']

        # Join the country names for consistency
        td = pd.merge(self.df, self.iso, how='left', left_on='iso3', right_on='iso3')

        # Format to the "long form"
        cnt = td.melt(id_vars=['name', 'year', 'iso3'], value_vars=['ACLED.COUNT', 'ACLED.FATALITIES'])
        cnt.rename(columns={'variable': 'Indicator Code',
                            'name': 'Country Name',
                            'iso3': 'Country Code'}, inplace=True)

        cnt['Indicator Name'] = cnt['Indicator Code'].apply(self.__indicator_names)
        cnt = cnt.reindex(columns=['Country Name',
                                   'Country Code',
                                   'Indicator Name',
                                   'Indicator Code',
                                   'year',
                                   'value'])

        self.df = cnt
