from .base import Transformer
import pandas as pd
import numpy as np
import os

ISO_COUNTRY_CODES = os.path.join(os.path.dirname(__file__), 'countrycodes.csv')


class UNTransformer(Transformer):
    """ Data source specific transformers """

    def __init__(self, source, target):
        super().__init__(source, target)
        self.iso = pd.read_csv(ISO_COUNTRY_CODES,
                               usecols=[0, 2, 3],
                               names=['name', 'iso3', 'country-code'],
                               header=0)

    def read(self):

        try:
            self.tot_df = pd.read_excel(self.source[0],
                                        usecols="E:BS",
                                        skiprows=16)

            self.male_df = pd.read_excel(self.source[1],
                                         usecols="E:BS",
                                         skiprows=16)

            self.female_df = pd.read_excel(self.source[2],
                                           usecols="E:BS",
                                           skiprows=16)

            self.growth_rate_df = pd.read_excel(self.source[3],
                                                usecols="E:R",
                                                skiprows=16)

        except FileNotFoundError as exc:
            raise ValueError("Source file {} not found.".format(self.source)) \
                from exc

    def write(self):
        self.df.to_csv(self.target, mode='w', index=False)

    def transform(self):
        # 1. Total Population
        un_df_tot = pd.melt(self.tot_df,
                            id_vars=['Country code'],
                            var_name='year')
        un_df_tot["Indicator Code"] = "UN.TOTL.POP"
        un_df_tot["Indicator Name"] = "UN total population"

        # 2. Total Male Population
        un_df_male = pd.melt(self.male_df,
                             id_vars=['Country code'],
                             var_name='year')
        un_df_male["Indicator Code"] = "UN.TOTL.POP_MALE"
        un_df_male["Indicator Name"] = "UN Total Male Population"

        # 3. Total Female Population
        un_df_female = pd.melt(self.male_df,
                               id_vars=['Country code'],
                               var_name='year')
        un_df_female["Indicator Code"] = "UN.TOTL.POP_FEMALE"
        un_df_female["Indicator Name"] = "UN Total Female Population"

        un_df = un_df_tot.append(un_df_male).append(un_df_female)

        # map country codes
        td = pd.merge(un_df, self.iso, how='left', left_on='Country code', right_on='country-code')
        td.drop(['country-code'], axis=1, inplace=True)

        td.value = td.value*1000  # UN Data in 1000's
        self.df = td

        # 4. Population Growth Rate

        self.growth_rate_df.rename(columns=lambda x: x.split("-")[0], inplace=True)
        growth_rate_master = self.growth_rate_df.drop('Country code', axis=1)

        # Growth for every five years. Copying out the value for the five years
        count = 0
        while (count < 4):
            count = count + 1
            growth_rate_copy = growth_rate_master.copy()
            growth_rate_copy.rename(columns=lambda x: str(int(x)+count), inplace=True)
            self.growth_rate_df = pd.concat([self.growth_rate_df, growth_rate_copy], axis=1, sort=False)

        self.growth_rate_df = pd.melt(self.growth_rate_df,
                                      id_vars=['Country code'],
                                      var_name='year')
        td = pd.merge(self.growth_rate_df, self.iso, how='left', left_on='Country code', right_on='country-code')
        td.drop(['country-code'], axis=1, inplace=True)
        td["Indicator Code"] = "UN.POP.GROWTH.RATE"
        td["Indicator Name"] = "UN Population Growth Rate"

        self.df = self.df.append(td, sort="False")
        self.df = self.df.dropna(how='any', axis=0)

        # Drop country code
        self.df.drop('Country code', axis=1, inplace=True)
        self.df.rename(columns={'iso3': 'Country Code', 'name': 'Country Name'}, inplace=True)

    def __repr__(self):
        return "<UNTransformer data for {}-{} ({} rows)>".format(self.df['year'].min(),
                                                                 self.df['year'].max(),
                                                                 len(self.df))
