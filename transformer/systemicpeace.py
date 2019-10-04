from .base import Transformer
import pandas as pd
import numpy as np
import os

ISO_COUNTRY_CODES = os.path.join(os.path.dirname(__file__), 'countrycodes.csv')


class SystemicPeaceTransformer(Transformer):
    """ Data source specific transformers """

    def __init__(self, source, target):
        super().__init__(source, target)
        self.iso = pd.read_csv(ISO_COUNTRY_CODES,
                               usecols=[0, 2],
                               names=['name', 'iso3'],
                               header=0)

    def read(self):

        try:
            self.forc_disp_pop_df = pd.read_excel(self.source[0],
                                                  usecols="C:G")

            self.pol_viol_df = pd.read_excel(self.source[1],
                                             usecols="C:L")

            self.state_fail_df = pd.read_excel(self.source[2],
                                               usecols="A:L")

        except FileNotFoundError as exc:
            raise ValueError("Source file {} not found.".format(self.source)) \
                from exc

    def write(self):
        self.df.to_csv(self.target, mode='w', index=False)

    def transform(self):
        # self.transform_forcibly_displaced_populations()
        self.transform_political_violence()
        self.transform_state_failure()
        self.transform_country_code()

    def __repr__(self):
        return "<SystemicPeaceTransformer data for {}-{} ({} rows)>".format(self.df['year'].min(),
                                                                            self.df['year'].max(),
                                                                            len(self.df))
    """
    def transform_forcibly_displaced_populations(self):

        refg_orig_df = self.forc_disp_pop_df[["country", "year", "source"]]
        refg_orig_df.columns.values[2] = 'value'
        idp_df = self.forc_disp_pop_df[["country", "year", "idp"]]
        idp_df.columns.values[2] = 'value'
        refg_host_df = self.forc_disp_pop_df[["country", "year", "host"]]
        refg_host_df.columns.values[2] = 'value'

        refg_orig_df.loc[:, "Indicator Code"] = "SP.FDP.REFG.ORIG"
        refg_orig_df.loc[:, "Indicator Name"] = "Number of Refugees (x1000) origination from country"
        idp_df.loc[:, "Indicator Code"] = "SP.FDP.IDP"
        idp_df.loc[:, "Indicator Name"] = "Number of internally displaced persons (x1000)"
        refg_host_df.loc[:, "Indicator Code"] = "SP.FDP.REFG.HOST"
        refg_host_df.loc[:, "Indicator Name"] = "Number of Refugees (x1000) hosted by the country"

        self.forc_disp_pop_df = refg_orig_df.append(idp_df, sort="True").append(refg_host_df, sort="True")
        self.forc_disp_pop_df = self.forc_disp_pop_df.dropna(how='any', axis=0)

        self.df = self.forc_disp_pop_df
    """

    def transform_political_violence(self):

        indp_df = self.pol_viol_df[["country", "year", "intind"]]
        indp_df.columns.values[2] = 'value'
        int_viol_df = self.pol_viol_df[["country", "year", "intviol"]]
        int_viol_df.columns.values[2] = 'value'
        int_war_df = self.pol_viol_df[["country", "year", "intwar"]]
        int_war_df.columns.values[2] = 'value'

        civ_viol_df = self.pol_viol_df[["country", "year", "civviol"]]
        civ_viol_df.columns.values[2] = 'value'
        civ_war_df = self.pol_viol_df[["country", "year", "civwar"]]
        civ_war_df.columns.values[2] = 'value'

        eth_viol_df = self.pol_viol_df[["country", "year", "ethviol"]]
        eth_viol_df.columns.values[2] = 'value'
        eth_war_df = self.pol_viol_df[["country", "year", "ethwar"]]
        eth_war_df.columns.values[2] = 'value'

        indp_df.loc[:, "Indicator Code"] = "SP.PV.INDP"
        indp_df.loc[:, "Indicator Name"] = "Magnitude score of episode of warfare episode. Scale: 1 (lowest) to 10 (highest)"
        int_viol_df.loc[:, "Indicator Code"] = "SP.PV.INT.VIOL"
        int_viol_df.loc[:, "Indicator Name"] = "Magnitude score of episode(s) of international violence. Scale: 1 (lowest) to 10 (highest)"
        int_war_df.loc[:, "Indicator Code"] = "SP.PV.INT.WAR"
        int_war_df.loc[:, "Indicator Name"] = "Magnitude score of episode(s) of international warfare.Scale: 1 (lowest) to 10 (highest)"

        civ_viol_df.loc[:, "Indicator Code"] = "SP.PV.CIV.VIOL"
        civ_viol_df.loc[:, "Indicator Name"] = "Magnitude score of episode(s) of civil violence. Scale: 1 (lowest) to 10 (highest) "
        civ_war_df.loc[:, "Indicator Code"] = "SP.PV.CIV.WAR"
        civ_war_df.loc[:, "Indicator Name"] = "Magnitude score of episode(s) of civil warfare. Scale: 1 (lowest) to 10 (highest) "

        eth_viol_df.loc[:, "Indicator Code"] = "SP.PV.ETH.VIOL"
        eth_viol_df.loc[:, "Indicator Name"] = "Magnitude score of episode(s) of ethnic violence. Scale: 1 (lowest) to 10 (highest) "
        eth_war_df.loc[:, "Indicator Code"] = "SP.PV.ETH.WAR"
        eth_war_df.loc[:, "Indicator Name"] = "Magnitude score of episode(s) of ethnic warfare. Scale: 1 (lowest) to 10 (highest) "

        self.pol_viol_df = indp_df.append(int_viol_df, sort="True")\
            .append(int_war_df, sort="True").append(civ_viol_df, sort="True").append(civ_war_df, sort="True").append(eth_viol_df, sort="True").append(eth_war_df, sort="True")

        self.pol_viol_df = self.pol_viol_df.dropna(how='any', axis=0)
        self.df = self.pol_viol_df

        # self.df = self.df.append(self.pol_viol_df, sort="False")

    def transform_state_failure(self):

        yr_begin_df = self.state_fail_df[["COUNTRY", "YEAR", "YRBEGIN"]]
        yr_begin_df.columns.values[2] = 'value'

        yr_end_df = self.state_fail_df[["COUNTRY", "YEAR", "YREND"]]
        yr_end_df.columns.values[2] = 'value'

        mag_fail_df = self.state_fail_df[["COUNTRY", "YEAR", "MAGFAIL"]]
        mag_fail_df.columns.values[2] = 'value'

        mag_col_df = self.state_fail_df[["COUNTRY", "YEAR", "MAGCOL"]]
        mag_col_df.columns.values[2] = 'value'
        mag_viol_df = self.state_fail_df[["COUNTRY", "YEAR", "MAGVIOL"]]
        mag_viol_df.columns.values[2] = 'value'

        yr_begin_df.loc[:, "Indicator Code"] = "SP.SF.YR.BEGIN"
        yr_begin_df.loc[:, "Indicator Name"] = "4-number numeric year denoting event beginning"

        yr_end_df.loc[:, "Indicator Code"] = "SP.SF.YR.END"
        yr_end_df.loc[:, "Indicator Name"] = "4-number numeric year denoting event ending (9999=ongoing)"

        mag_fail_df.loc[:, "Indicator Code"] = "SP.SF.MAG.FAIL"
        mag_fail_df.loc[:, "Indicator Name"] = "Scaled failure of State authority (range 1-4; 9=missing)"

        mag_col_df.loc[:, "Indicator Code"] = "SP.SF.MAG.COLLAPSE"
        mag_col_df.loc[:, "Indicator Name"] = "Scaled collapse of democratic institutions (range 1-4; 9=missing)"
        mag_viol_df.loc[:, "Indicator Code"] = "SP.SF.MAG.VIOL"
        mag_viol_df.loc[:, "Indicator Name"] = "Scaled violence associated with regime transition (range 1-4; 9=missing)"

        self.state_fail_df = yr_begin_df.append(yr_end_df, sort="True").append(
            mag_fail_df, sort="True").append(mag_col_df, sort="True").append(mag_viol_df, sort="True")

        self.state_fail_df.rename(columns={'COUNTRY': 'country', 'YEAR': 'year'}, inplace=True)

        self.state_fail_df = self.state_fail_df.dropna(how='any', axis=0)
        self.df = self.df.append(self.state_fail_df, sort="False")

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
