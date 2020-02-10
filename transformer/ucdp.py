from .base import Transformer
import pandas as pd
import numpy as np
import os

ISO_COUNTRY_CODES = os.path.join(os.path.dirname(__file__), 'countrycodes.csv')


class UCDPTransformer(Transformer):
    """ Data source specific transformers """

    def __init__(self, source, target):
        super().__init__(source, target)
        self.iso = pd.read_csv(ISO_COUNTRY_CODES,
                               usecols=[0, 2],
                               names=['name', 'iso3'],
                               header=0)

    def read(self):

        try:
            self.ucdp_df = pd.read_csv(self.source[0])


        except FileNotFoundError as exc:
            raise ValueError("Source file {} not found.".format(self.source)) \
                from exc

    def write(self):
        self.df.to_csv(self.target, mode='w', index=False)

    def transform(self):
        # self.transform_forcibly_displaced_populations()
        self.transform_ucdp()
        self.transform_country_code()

    def __repr__(self):
        return "<UCDPTransformer data for {}-{} ({} rows)>".format(self.df['year'].min(),
                                                                            self.df['year'].max(),
                                                                            len(self.df))


    def transform_ucdp(self):
        
        events_df = self.ucdp_df.groupby(['year', 'country'])['best'].agg(['size'])
        events_df.reset_index(inplace=True)
        
        unique_states = events_df.drop_duplicates("country")[["country"]]
        unique_states["key"] = 1
        unique_years = events_df.drop_duplicates("year")[["year"]]
        unique_years["key"] = 1
        
        states_years_df = pd.merge(unique_states, unique_years, on = "key").drop("key",axis=1)
        
        events_df = pd.merge(states_years_df, events_df, how = "left", on = ["country","year"]).fillna(0)
        
        events_df.columns.values[2] = 'value'
        
        subevents_df = self.ucdp_df.groupby(['year', 'country', 'type_of_violence'])['best'].agg(['size'])
        subevents_df.reset_index(inplace=True)
        
        state_based_df = subevents_df[subevents_df['type_of_violence'] == 1][['year', 'country', 'size']]
        state_based_df = pd.merge(states_years_df, state_based_df, how = "left", on = ["country","year"]).fillna(0)
        state_based_df.columns.values[2] = 'value'
        nonstate_df = subevents_df[subevents_df['type_of_violence'] == 2][['year', 'country', 'size']]
        nonstate_df = pd.merge(states_years_df, nonstate_df, how = "left", on = ["country","year"]).fillna(0)
        nonstate_df.columns.values[2] = 'value'
        one_sided_df = subevents_df[subevents_df['type_of_violence'] == 3][['year', 'country', 'size']]
        one_sided_df = pd.merge(states_years_df, one_sided_df, how = "left", on = ["country","year"]).fillna(0)
        one_sided_df.columns.values[2] = 'value'
        
        rakhine_df = self.ucdp_df[self.ucdp_df['adm_1'] == "Rakhine State"]
        
        myanmar_df = rakhine_df.groupby(['year'])['best'].agg(['size'])
        myanmar_df = pd.merge(unique_years, myanmar_df, how = "left", on = ["year"]).fillna(0).drop("key", axis=1)
        myanmar_df.columns.values[1] = 'value'
        myanmar_df["country"] = "Myanmar"

        events_df.loc[:, "Indicator Code"] = "UC.EVT.TOT"
        events_df.loc[:, "Indicator Name"] = "Number of conflict events per year"
        state_based_df.loc[:, "Indicator Code"] = "UC.EVT.STA"
        state_based_df.loc[:, "Indicator Name"] = "Number of state-based conflict events per year"
        nonstate_df.loc[:, "Indicator Code"] = "UC.EVT.NON"
        nonstate_df.loc[:, "Indicator Name"] = "Number of non-state conflict events per year"
        one_sided_df.loc[:, "Indicator Code"] = "UC.EVT.ONE"
        one_sided_df.loc[:, "Indicator Name"] = "Number of one-sided conflict events per year"
        myanmar_df.loc[:, "Indicator Code"] = "UC.EVT.RAKH"
        myanmar_df.loc[:, "Indicator Name"] = "Number of conflict events in Rakhine State per year"
        
        events_fatal = self.ucdp_df.groupby(['year', 'country'])['best'].agg(['sum'])
        events_fatal.reset_index(inplace=True)
        
        events_fatal = pd.merge(states_years_df, events_fatal, how = "left", on = ["country","year"]).fillna(0)
        events_fatal.columns.values[2] = 'value'
        
        civil_fatal = self.ucdp_df.groupby(['year', 'country'])['deaths_civilians'].agg(['sum'])
        civil_fatal.reset_index(inplace=True)
        
        civil_fatal = pd.merge(states_years_df, civil_fatal, how = "left", on = ["country","year"]).fillna(0)
        civil_fatal.columns.values[2] = 'value'
        
        subevents_fatal = self.ucdp_df.groupby(['year', 'country', 'type_of_violence'])['best'].agg(['sum'])
        subevents_fatal.reset_index(inplace=True)
        
        state_based_fatal = subevents_fatal[subevents_df['type_of_violence'] == 1][['year', 'country', 'sum']]
        state_based_fatal = pd.merge(states_years_df, state_based_fatal, how = "left", on = ["country","year"]).fillna(0)
        state_based_fatal.columns.values[2] = 'value'
        nonstate_fatal = subevents_fatal[subevents_df['type_of_violence'] == 2][['year', 'country', 'sum']]
        nonstate_fatal = pd.merge(states_years_df, nonstate_fatal, how = "left", on = ["country","year"]).fillna(0)
        nonstate_fatal.columns.values[2] = 'value'
        one_sided_fatal = subevents_fatal[subevents_df['type_of_violence'] == 3][['year', 'country', 'sum']]
        one_sided_fatal = pd.merge(states_years_df, one_sided_fatal, how = "left", on = ["country","year"]).fillna(0)
        one_sided_fatal.columns.values[2] = 'value'
        
        
        rakhine_fatal = self.ucdp_df[self.ucdp_df['adm_1'] == "Rakhine State"]
        
        myanmar_fatal = rakhine_fatal.groupby(['year'])['best'].agg(['sum'])
        myanmar_fatal = pd.merge(unique_years, myanmar_fatal, how = "left", on = ["year"]).fillna(0).drop("key", axis=1)
        myanmar_fatal.columns.values[1] = 'value'
        myanmar_fatal["country"] = "Myanmar"

        events_fatal.loc[:, "Indicator Code"] = "UC.FAT.TOT"
        events_fatal.loc[:, "Indicator Name"] = "Fatalities from conflict events per year"
        civil_fatal.loc[:, "Indicator Code"] = "UC.FAT.CIV"
        civil_fatal.loc[:, "Indicator Name"] = "Civilian fatalities from conflict events per year"
        state_based_fatal.loc[:, "Indicator Code"] = "UC.FAT.STA"
        state_based_fatal.loc[:, "Indicator Name"] = "Fatalities from state-based conflict events per year"
        nonstate_fatal.loc[:, "Indicator Code"] = "UC.FAT.NON"
        nonstate_fatal.loc[:, "Indicator Name"] = "Fatalities from non-state conflict events per year"
        one_sided_fatal.loc[:, "Indicator Code"] = "UC.FAT.ONE"
        one_sided_fatal.loc[:, "Indicator Name"] = "Fatalities from one-sided conflict events per year"
        myanmar_fatal.loc[:, "Indicator Code"] = "UC.FAT.RAKH"
        myanmar_fatal.loc[:, "Indicator Name"] = "Number of fatalities in Rakhine State per year"
        
        self.ucdp_df = events_df.append(state_based_df, sort="True").append(nonstate_df, sort="True").append(one_sided_df, sort="True").append(myanmar_df, sort="True").append(events_fatal, sort="True").append(state_based_fatal, sort="True").append(nonstate_fatal, sort="True").append(one_sided_fatal, sort="True").append(civil_fatal, sort="True").append(myanmar_fatal, sort="True")

        self.ucdp_df = self.ucdp_df.dropna(how='any', axis=0)
        self.df = self.ucdp_df



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
