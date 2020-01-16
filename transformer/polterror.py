from .base import Transformer
import pandas as pd
import numpy as np
import os

ISO_COUNTRY_CODES = os.path.join(os.path.dirname(__file__), 'countrycodes.csv')


class PolTerrorTransformer(Transformer):
    """ Data source specific transformers """

    def __init__(self, source, target):
        super().__init__(source, target)
        self.iso = pd.read_csv(ISO_COUNTRY_CODES,
                               usecols=[0, 2],
                               names=['name', 'iso3'],
                               header=0)

    def read(self):

        try:
            self.pol_terror_df = pd.read_excel(self.source[0],
                                                  usecols="A:K")


        except FileNotFoundError as exc:
            raise ValueError("Source file {} not found.".format(self.source)) \
                from exc

    def write(self):
        self.df.to_csv(self.target, mode='w', index=False)

    def transform(self):
        # self.transform_forcibly_displaced_populations()
        self.transform_pol_terror()

    def __repr__(self):
        return "<PolTerrorTransformer data for {}-{} ({} rows)>".format(self.df['year'].min(),
                                                                            self.df['year'].max(),
                                                                            len(self.df))


    def transform_pol_terror(self):

        terror_df = self.pol_terror_df[["WordBank_Code_A","Country", "Year", "PTS_A","PTS_H","PTS_S"]]
        terror_df['MaxPTS'] = terror_df[['PTS_A','PTS_H','PTS_S']].max(axis=1, skipna=True)
        
        terror_df.columns.values[6] = 'value'
        

        terror_df.loc[:, "Indicator Code"] = "PTS.MAX.TER"
        terror_df.loc[:, "Indicator Name"] = "Maximum magnitude score of the three scales of political terror Scale: 1 (lowest) to 5 (highest)"
        
        self.pol_terror_df = terror_df[["WordBank_Code_A","Country", "Year", "value", "Indicator Code", "Indicator Name"]]
        
        self.pol_terror_df.rename(columns={
            'WordBank_Code_A': 'Country Code',
            'Country': 'Country Name'}, inplace=True)

        self.pol_terror_df = self.pol_terror_df.dropna(how='any', axis=0)
        self.pol_terror_df.rename(columns={'Year': 'year'}, inplace=True)
        self.df = self.pol_terror_df

        # self.df = self.df.append(self.pol_viol_df, sort="False")

 