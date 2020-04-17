from .base import Transformer
import pandas as pd
import numpy as np
import os

ISO_COUNTRY_CODES = os.path.join(os.path.dirname(__file__), 'countrycodes.csv')


class FragileTransformer(Transformer):
    """ Data source specific transformers """

    def __init__(self, source, target):
        super().__init__(source, target)
        self.iso = pd.read_csv(ISO_COUNTRY_CODES,
                               usecols=[0, 2],
                               names=['name', 'iso3'],
                               header=0)

    def read(self):

        try:
            self.fragile_df = pd.DataFrame()
            for f in range(14):
                data = pd.read_excel(self.source[f], usecols="A:P")
                data["year"] = 2006+f
                self.fragile_df = self.fragile_df.append(data)


        except FileNotFoundError as exc:
            raise ValueError("Source file {} not found.".format(self.source)) \
                from exc

    def write(self):
        self.df.to_csv(self.target, mode='w', index=False)

    def transform(self):
        # self.transform_forcibly_displaced_populations()
        self.transform_fragile()
        self.transform_country_code()

    def __repr__(self):
        return "<PolityTransformer data for {}-{} ({} rows)>".format(self.df['year'].min(),
                                                                            self.df['year'].max(),
                                                                            len(self.df))


    def transform_fragile(self):

        secur_df = self.fragile_df[["Country", "year", "C1: Security Apparatus"]]
        secur_df.columns.values[2] = 'value'
        elite_df = self.fragile_df[["Country", "year", "C2: Factionalized Elites"]]
        elite_df.columns.values[2] = 'value'
        group_df = self.fragile_df[["Country", "year", "C3: Group Grievance"]]
        group_df.columns.values[2] = 'value'
        econo_df = self.fragile_df[["Country", "year", "E1: Economy"]]
        econo_df.columns.values[2] = 'value'
        ineq_df = self.fragile_df[["Country", "year", "E2: Economic Inequality"]]
        ineq_df.columns.values[2] = 'value'
        flight_df = self.fragile_df[["Country", "year", "E3: Human Flight and Brain Drain"]]
        flight_df.columns.values[2] = 'value'
        state_df = self.fragile_df[["Country", "year", "P1: State Legitimacy"]]
        state_df.columns.values[2] = 'value'
        public_df = self.fragile_df[["Country", "year", "P2: Public Services"]]
        public_df.columns.values[2] = 'value'
        rights_df = self.fragile_df[["Country", "year", "P3: Human Rights"]]
        rights_df.columns.values[2] = 'value'
        demog_df = self.fragile_df[["Country", "year", "S1: Demographic Pressures"]]
        demog_df.columns.values[2] = 'value'
        refug_df = self.fragile_df[["Country", "year", "S2: Refugees and IDPs"]]
        refug_df.columns.values[2] = 'value'
        inter_df = self.fragile_df[["Country", "year", "X1: External Intervention"]]
        inter_df.columns.values[2] = 'value'


        secur_df.loc[:, "Indicator Code"] = "FSI.SEC.APP"
        secur_df.loc[:, "Indicator Name"] = "Fragile States Index: Security Apparatus (0-10, where 10 is the most fragile)"
        elite_df.loc[:, "Indicator Code"] = "FSI.FAC.ELI"
        elite_df.loc[:, "Indicator Name"] = "Fragile States Index: Factionalized Elites (0-10, where 10 is the most fragile)"
        group_df.loc[:, "Indicator Code"] = "FSI.GRP.GRI"
        group_df.loc[:, "Indicator Name"] = "Fragile States Index: Group Grievance (0-10, where 10 is the most fragile)"
        econo_df.loc[:, "Indicator Code"] = "FSI.ECON"
        econo_df.loc[:, "Indicator Name"] = "Fragile States Index: Economy (0-10, where 10 is the most fragile)"
        ineq_df.loc[:, "Indicator Code"] = "FSI.ECON.INQ"
        ineq_df.loc[:, "Indicator Name"] = "Fragile States Index: Economic Inequality (0-10, where 10 is the most fragile)"
        flight_df.loc[:, "Indicator Code"] = "FSI.HMN.FLI"
        flight_df.loc[:, "Indicator Name"] = "Fragile States Index: Human Flight and Brain Drain (0-10, where 10 is the most fragile)"
        state_df.loc[:, "Indicator Code"] = "FSI.STA.LEG"
        state_df.loc[:, "Indicator Name"] = "Fragile States Index: State Legitimacy (0-10, where 10 is the most fragile)"
        public_df.loc[:, "Indicator Code"] = "FSI.PUB.SER"
        public_df.loc[:, "Indicator Name"] = "Fragile States Index: Public Services (0-10, where 10 is the most fragile)"
        rights_df.loc[:, "Indicator Code"] = "FSI.HMN.RIG"
        rights_df.loc[:, "Indicator Name"] = "Fragile States Index: Human Rights (0-10, where 10 is the most fragile)"
        demog_df.loc[:, "Indicator Code"] = "FSI.DEM.PRS"
        demog_df.loc[:, "Indicator Name"] = "Fragile States Index: Demographic Pressures (0-10, where 10 is the most fragile)"
        refug_df.loc[:, "Indicator Code"] = "FSI.REF.IDP"
        refug_df.loc[:, "Indicator Name"] = "Fragile States Index: Refugees and IDPs (0-10, where 10 is the most fragile)"
        inter_df.loc[:, "Indicator Code"] = "FSI.EXT.INT"
        inter_df.loc[:, "Indicator Name"] = "Fragile States Index: External Intervention (0-10, where 10 is the most fragile)"


        self.fragile_df = secur_df.append(elite_df, sort="True").append(group_df, sort="True").append(econo_df, sort="True").append(ineq_df, sort="True").append(flight_df, sort="True").append(state_df, sort="True").append(public_df, sort="True").append(rights_df, sort="True").append(demog_df, sort="True").append(refug_df, sort="True").append(inter_df, sort="True")
        
        self.fragile_df.rename(columns={'Country': 'country'}, inplace=True)

        self.fragile_df = self.fragile_df.dropna(how='any', axis=0)
        self.df = self.fragile_df



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
