from .base import Transformer
import pandas as pd
import numpy as np
import os

ISO_COUNTRY_CODES = os.path.join(os.path.dirname(__file__), 'countrycodes.csv')


class PolityTransformer(Transformer):
    """ Data source specific transformers """

    def __init__(self, source, target):
        super().__init__(source, target)
        self.iso = pd.read_csv(ISO_COUNTRY_CODES,
                               usecols=[0, 2],
                               names=['name', 'iso3'],
                               header=0)

    def read(self):

        try:
            self.polity_df = pd.read_excel(self.source[0],
                                                  usecols="D:K")


        except FileNotFoundError as exc:
            raise ValueError("Source file {} not found.".format(self.source)) \
                from exc

    def write(self):
        self.df.to_csv(self.target, mode='w', index=False)

    def transform(self):
        # self.transform_forcibly_displaced_populations()
        self.transform_polity()
        self.transform_country_code()

    def __repr__(self):
        return "<PolityTransformer data for {}-{} ({} rows)>".format(self.df['year'].min(),
                                                                            self.df['year'].max(),
                                                                            len(self.df))


    def transform_polity(self):

        democ_df = self.polity_df[["country", "year", "democ"]]
        democ_df.columns.values[2] = 'value'
        autoc_df = self.polity_df[["country", "year", "autoc"]]
        autoc_df.columns.values[2] = 'value'
        score_df = self.polity_df[["country", "year", "polity2"]]
        score_df.columns.values[2] = 'value'


        democ_df.loc[:, "Indicator Code"] = "SP.POL.DEM"
        democ_df.loc[:, "Indicator Name"] = "Polity Index: Institutionalized Democracy (0-10)"
        autoc_df.loc[:, "Indicator Code"] = "SP.POL.AUT"
        autoc_df.loc[:, "Indicator Name"] = "Polity Index: Institutionalized Autocracy (0-10)"
        score_df.loc[:, "Indicator Code"] = "SP.POL.SCR.TWO"
        score_df.loc[:, "Indicator Name"] = "Polity Index: Revised Combined PolityScore (-10 - 10)"


        self.polity_df = democ_df.append(autoc_df, sort="True").append(score_df, sort="True")

        self.polity_df = self.polity_df.dropna(how='any', axis=0)
        self.df = self.polity_df



    def transform_country_code(self):
        # map country codes
        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("United States", "United States of America")
        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("Trinidad & Tobago", "Trinidad and Tobago")
        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("Venezuela", "Venezuela (Bolivarian Republic of)")
        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("Bolivia", "Bolivia (Plurinational State of)")
        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("United Kingdom", "United Kingdom of Great Britain and Northern Ireland")
        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("Germany West", "Germany")
        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("Germany East", "Germany")
        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("Czechoslovakia", "Czechia")
        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("Czech Republic", "Czechia")
        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("Slovak Republic", "Slovakia")
        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("Macedonia",
                                                                    "Macedonia (the former Yugoslav Republic of)")

        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("Yugoslavia", "Yugoslavia")  #
        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("Bosnia", "Bosnia and Herzegovina")
        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("Serbia and Montenegro", "Serbia")  #
        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("Moldova", "Moldova (Republic of)")
        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("Russia", "Russian Federation")
        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("Ivory Coast", "Côte d'Ivoire")
        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("Congo-Brazzaville", "Congo")
        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("Congo-Kinshasa",
                                                                    "Congo (Democratic Republic of the)")
        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("Congo Brazzaville", "Congo")
        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("Congo Kinshasa",
                                                                    "Congo (Democratic Republic of the)")
        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("Tanzania", "Tanzania, United Republic of")
        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("Iran", "Iran (Islamic Republic of)")
        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("Syria", "Syrian Arab Republic")

        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("Palestine", "Palestine, State of")
        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("Yemen Arab Republic", "Yemen")
        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("Yemen PDR", "Yemen")
        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("Taiwan", "Taiwan, Province of China")
        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("Korea North",
                                                                    "Korea (Democratic People's Republic of)")
        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("Korea South", "Korea (Republic of)")
        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("North Korea",
                                                                    "Korea (Democratic People's Republic of)")
        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("South Korea", "Korea (Republic of)")
        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("Myanmar (Burma)", "Myanmar")
        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("Laos", "Lao People's Democratic Republic")
        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("Vietnam", "Viet Nam")
        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("East Timor", "Timor-Leste")

        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("Eastern Europe", "Eastern Europe")  #
        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("Latin America", "Latin America")  #
        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("Former Yugoslavia", "Former Yugoslavia")  #
        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("Former USSR", "Former USSR")  #
        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("Cape Verde", "Cabo Verde")
        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("Central African Repub", "Central African Republic")
        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("Vietnam North", "Viet Nam")  #
        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("Guinea Bissau", "Guinea-Bissau")
        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("Kosovo", "Serbia")  #
        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("Vietnam South", "Viet Name")  #
        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("(North) Sudan", "Sudan")  #
        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("Trinidad", "Trinidad and Tobago")  #
        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("USSR (Soviet Union)", "Russian Federation")  #
        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("Yemen North", "Yemen")  #
        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("Yemen South", "Yemen")  #
        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("Cape Verde", "Cabo Verde")
        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("Viet Name", "Viet Nam")

        self.df = pd.merge(self.df, self.iso, how='left', left_on='country', right_on='name')
        self.df.drop(['name'], axis=1, inplace=True)

        # standardize
        self.df.rename(columns={
            'iso3': 'Country Code',
            'country': 'Country Name'}, inplace=True)
