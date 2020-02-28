from .base import Transformer
import pandas as pd
import numpy as np
import os

ISO_COUNTRY_CODES = os.path.join(os.path.dirname(__file__), 'countrycodes.csv')


class HumanRightsTransformer(Transformer):
    """ Data source specific transformers """
    def __init__(self, source, target):
        super().__init__(source, target)
        self.iso = pd.read_csv(ISO_COUNTRY_CODES,
                               usecols=[0, 2],
                               names=['name', 'iso3'],
                               header=0)

    def read(self):

        try:
            self.scor_df = pd.read_csv(self.source,
                                        usecols=[1,25,26,27],
                                        names=['year', 'mean', 'sd', 'country'],
                                       header=0)


        except FileNotFoundError as exc:
            raise ValueError("Source file {} not found.".format(self.source)) \
                from exc

    def write(self):
        self.df.to_csv(self.target, mode='w', index=False)

    def transform(self):
        self.transform_human_rights_score()
        self.transform_country_code()

    def __repr__(self):
        return "<HumanRightsTransformer data for {}-{} ({} rows)>".format(self.df['year'].min(),
                                                                  self.df['year'].max(),
                                                                  len(self.df))

    def transform_human_rights_score(self):
        scr_mn_df = self.scor_df[["year", "country", "mean"]]
        scr_mn_df.columns.values[2] = 'value'
        scr_sd_df = self.scor_df[["year", "country", "sd"]]
        scr_sd_df.columns.values[2] = 'value'

        scr_mn_df.loc[:, "Indicator Code"] = "HR.SCR.MEAN"
        scr_mn_df.loc[:, "Indicator Name"] = "Human Rights Score Mean"
        scr_sd_df.loc[:, "Indicator Code"] = "HR.SCR.SD"
        scr_sd_df.loc[:, "Indicator Name"] = "Human Rights Score Standard Deviation"

        self.scor_df = scr_mn_df.append(scr_sd_df, sort="True")
        self.scor_df = self.scor_df.dropna(how='any', axis=0)

        self.df = self.scor_df



    def transform_country_code(self):
        # map country codes
        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("United States","United States of America")
        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("Trinidad & Tobago", "Trinidad and Tobago")
        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("Venezuela", "Venezuela (Bolivarian Republic of)")
        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("Bolivia", "Bolivia (Plurinational State of)")
        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("United Kingdom", "United Kingdom of Great Britain and Northern Ireland")
        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("Germany West", "Germany")
        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("Germany East", "Germany")
        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("Czechoslovakia", "Czechia")
        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("Czech Republic", "Czechia")
        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("Slovak Republic", "Slovakia")
        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("Macedonia", "Macedonia (the former Yugoslav Republic of)")

        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("Yugoslavia", "Yugoslavia") #
        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("Bosnia", "Bosnia and Herzegovina")
        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("Serbia and Montenegro", "Serbia") #
        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("Moldova", "Moldova (Republic of)")
        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("Russia", "Russian Federation")
        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("Ivory Coast", "Côte d'Ivoire")
        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("Congo-Brazzaville", "Congo")
        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("Congo-Kinshasa", "Congo (Democratic Republic of the)")
        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("Congo Brazzaville", "Congo")
        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("Congo Kinshasa", "Congo (Democratic Republic of the)")
        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("Tanzania", "Tanzania, United Republic of")
        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("Iran", "Iran (Islamic Republic of)")
        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("Syria", "Syrian Arab Republic")

        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("Palestine", "Palestine, State of")
        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("Yemen Arab Republic", "Yemen")
        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("Yemen PDR", "Yemen")
        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("Taiwan", "Taiwan, Province of China")
        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("Korea North", "Korea (Democratic People's Republic of)")
        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("Korea South", "Korea (Republic of)")
        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("North Korea", "Korea (Democratic People's Republic of)")
        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("South Korea", "Korea (Republic of)")
        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("Myanmar (Burma)", "Myanmar")
        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("Laos", "Lao People's Democratic Republic")
        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("Vietnam", "Viet Nam")
        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("East Timor", "Timor-Leste")

        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("Eastern Europe", "Eastern Europe") #
        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("Latin America", "Latin America") #
        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("Former Yugoslavia", "Former Yugoslavia") #
        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("Former USSR", "Former USSR") #
        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("St. Lucia", "Saint Lucia")
        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("St. Vincent and the Grenadines", "Saint Vincent and the Grenadines")
        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("Antigua & Barbuda", "Antigua and Barbuda")
        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("St. Kitts and Nevis", "Saint Kitts and Nevis")
        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("Republic of Vietnam", "Viet Nam")
        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("Brunei", "Brunei Darussalam")
        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("Federated States of Micronesia", "Micronesia (Federated States of)")

        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("Yemen People's Republic", "Yemen")
        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("Palestinian Authority", "Palestine, State of")
        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("Israel, occupied territories only", "Israel")
        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("Israel, pre-1967 borders", "Israel")
        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("Zanzibar", "Tanzania, United Republic of")
        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("Democratic Republic of the Congo", "Congo (Democratic Republic of the)")
        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("Cape Verde", "Cabo Verde")
        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("Kosovo", "Serbia")
        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("Yugoslavia", "Yugoslavia") #

        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("German Democratic Republic", "Germany")
        self.df.loc[:, "country"] = self.df.loc[:, "country"].replace("German Federal Republic", "Germany")


        self.df = pd.merge(self.df, self.iso, how='left', left_on='country', right_on='name')
        self.df.drop(['name'], axis=1, inplace=True)

        # standardize
        self.df.rename(columns={
                                'iso3': 'Country Code',
                                'country': 'Country Name'}, inplace=True)
