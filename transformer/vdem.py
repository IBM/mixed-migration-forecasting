from .base import Transformer
import pandas as pd
import numpy as np
import os

ISO_COUNTRY_CODES = os.path.join(os.path.dirname(__file__), 'countrycodes.csv')


class VDemTransformer(Transformer):
    """ Data source specific transformers """

    def __init__(self, source, target):
        super().__init__(source, target)
        self.iso = pd.read_csv(ISO_COUNTRY_CODES,
                               usecols=[0, 2],
                               names=['name', 'iso3'],
                               header=0)

    def read(self):

        try:
            self.vdem_df = pd.read_csv(self.source[0])


        except FileNotFoundError as exc:
            raise ValueError("Source file {} not found.".format(self.source)) \
                from exc

    def write(self):
        self.df.to_csv(self.target, mode='w', index=False)

    def transform(self):
        # self.transform_forcibly_displaced_populations()
        self.transform_vdem()
        self.transform_country_code()

    def __repr__(self):
        return "<VDemTransformer data for {}-{} ({} rows)>".format(self.df['year'].min(),
                                                                            self.df['year'].max(),
                                                                            len(self.df))


    def transform_vdem(self):

        poly_df = self.vdem_df[["country_name", "year", "v2x_polyarchy"]]
        poly_df.columns.values[2] = 'value'
        relig_df = self.vdem_df[["country_name", "year", "v2clrelig"]]
        relig_df.columns.values[2] = 'value'
        kill_df = self.vdem_df[["country_name", "year", "v2clkill"]]
        kill_df.columns.values[2] = 'value'

        ex_pol_df = self.vdem_df[["country_name", "year", "v2xpe_exlpol"]]
        ex_pol_df.columns.values[2] = 'value'
        ex_soc_df = self.vdem_df[["country_name", "year", "v2xpe_exlsocgr"]]
        ex_soc_df.columns.values[2] = 'value'


        poly_df.loc[:, "Indicator Code"] = "VDEM.DEM.IDX"
        poly_df.loc[:, "Indicator Name"] = "V-Dem: Electoral democracy index"
        relig_df.loc[:, "Indicator Code"] = "VDEM.FRD.REL"
        relig_df.loc[:, "Indicator Name"] = "V-Dem: Freedom of religion"
        kill_df.loc[:, "Indicator Code"] = "VDEM.FRD.POL.KILL"
        kill_df.loc[:, "Indicator Name"] = "V-Dem: Freedom from political killings"

        ex_pol_df.loc[:, "Indicator Code"] = "VDEM.EXL.POL.GRP"
        ex_pol_df.loc[:, "Indicator Name"] = "V-Dem: Exclusion by Political Group index"
        ex_soc_df.loc[:, "Indicator Code"] = "VDEM.EXL.SOC.GRP"
        ex_soc_df.loc[:, "Indicator Name"] = "V-Dem: Exclusion by Social Group index "

        self.vdem_df = poly_df.append(relig_df, sort="True")\
            .append(kill_df, sort="True").append(ex_pol_df, sort="True").append(ex_soc_df, sort="True")

        self.vdem_df.rename(columns={'country_name': 'country'}, inplace=True)

        self.vdem_df = self.vdem_df.dropna(how='any', axis=0)
        self.df = self.vdem_df



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
        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("Burma/Myanmar", "Myanmar")
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
