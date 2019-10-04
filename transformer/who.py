from .base import Transformer
import pandas as pd
import numpy as np
import os

ISO_COUNTRY_CODES = os.path.join(os.path.dirname(__file__), 'countrycodes.csv')


class WHOTransformer(Transformer):
    """ Data source specific transformers """

    def __init__(self, source, target):
        super().__init__(source, target)
        self.iso = pd.read_csv(ISO_COUNTRY_CODES,
                               usecols=[0, 2, 3],
                               names=['name', 'iso3', 'country-code'],
                               header=0)

    def read(self):

        try:
            self.mat_mort_df = pd.read_csv(self.source[0],
                                           usecols=[0, 1, 2])

            self.mat_dth_df = pd.read_csv(self.source[0],
                                          usecols=[0, 1, 3])

            self.tb_tmt_cvage = pd.read_csv(self.source[1],
                                            usecols=[0, 1, 2, 3, 4])

            self.neo_mort_df = pd.read_csv(self.source[2],
                                           usecols=[0, 1, 2, 3, 4])

            self.ext_hlth_exp_df = pd.read_csv(self.source[3],
                                               skiprows=1)

            self.oop_exp_df = pd.read_csv(self.source[4],
                                          skiprows=1)

        except FileNotFoundError as exc:
            raise ValueError("Source file {} not found.".format(self.source)) \
                from exc

    def write(self):
        self.df.to_csv(self.target, mode='w', index=False)

    def transform(self):

        self.transform_maternal_mortality()
        self.transform_maternal_deaths()
        self.transform_tubercolosis_treatment_coverage()
        self.transform_neonatal_mortality()
        self.transform_external_health_expenditure()
        self.transform_out_of_pocket_expenditure()
        self.transform_country_code()

    def __repr__(self):
        return "<WHOTransformer data for {}-{} ({} rows)>".format(self.df['year'].min(),
                                                                  self.df['year'].max(),
                                                                  len(self.df))

    def transform_tubercolosis_treatment_coverage(self):
        self.tb_tmt_cvage.ix[:, 2] = (self.tb_tmt_cvage.ix[:, 2].str.split("[")).str[0].replace("No data", np.nan)
        self.tb_tmt_cvage.ix[:, 3] = (self.tb_tmt_cvage.ix[:, 3].str.split("[")).str[0].replace("No data", np.nan)
        self.tb_tmt_cvage.ix[:, 4] = (self.tb_tmt_cvage.ix[:, 4].str.split("[")).str[0].replace("No data", np.nan)

        tmt_cov_df = self.tb_tmt_cvage[["Country", "Year", "Tuberculosis treatment coverage"]]
        tmt_cov_df.columns.values[2] = 'value'
        num_tb_df = self.tb_tmt_cvage[["Country", "Year", "Number of incident tuberculosis cases"]]
        num_tb_df.columns.values[2] = 'value'
        tb_cas_df = self.tb_tmt_cvage[["Country", "Year", "Tuberculosis - new and relapse cases"]]
        tb_cas_df.columns.values[2] = 'value'

        tmt_cov_df.loc[:, "Indicator Code"] = "WHO.TB.TMT.COV"
        tmt_cov_df.loc[:, "Indicator Name"] = "Tuberculosis treatment coverage"
        num_tb_df.loc[:, "Indicator Code"] = "WHO.NUM.TB.CAS"
        num_tb_df.loc[:, "Indicator Name"] = "Number of incident tuberculosis cases"
        tb_cas_df.loc[:, "Indicator Code"] = "WHO.TB.CAS"
        tb_cas_df.loc[:, "Indicator Name"] = "Tuberculosis - new and relapse cases"

        self.tb_tmt_cvage = tmt_cov_df.append(num_tb_df, sort="True").append(tb_cas_df, sort="True")
        self.tb_tmt_cvage = self.tb_tmt_cvage.dropna(how='any', axis=0)

        self.df = self.df.append(self.tb_tmt_cvage, sort="False")

    def transform_maternal_mortality(self):
        self.mat_mort_df.ix[:, 2] = (self.mat_mort_df.ix[:, 2].str.split("[")).str[0]
        self.mat_mort_df.ix[:, 2] = (self.mat_mort_df.ix[:, 2]).str.replace(" ", "")
        self.mat_mort_df["Indicator Code"] = "WHO.MAT.MORT.RATIO"
        self.mat_mort_df["Indicator Name"] = "Maternal mortality ratio (per 100 000 live births)"
        self.mat_mort_df.columns.values[2] = 'value'
        self.df = self.mat_mort_df

    def transform_maternal_deaths(self):
        self.mat_dth_df.ix[:, 2] = (self.mat_dth_df.ix[:, 2].str.split("[")).str[0]
        self.mat_dth_df.ix[:, 2] = (self.mat_dth_df.ix[:, 2]).str.replace(" ", "")

        self.mat_dth_df["Indicator Code"] = "WHO.MAT.DEATHS"
        self.mat_dth_df["Indicator Name"] = "Number of maternal deaths"
        self.mat_dth_df.columns.values[2] = 'value'
        self.mat_dth_df.ix[:, "value"] = self.mat_dth_df.ix[:, "value"].replace("", np.nan)
        self.mat_dth_df = self.mat_dth_df.dropna(how='any', axis=0)
        self.df = self.df.append(self.mat_dth_df, sort="False")

    def transform_neonatal_mortality(self):
        und_fiv_df = self.neo_mort_df[["Country", "Year", "Number of under-five deaths (thousands)"]]
        und_fiv_df.columns.values[2] = 'value'
        inf_dth_df = self.neo_mort_df[["Country", "Year", "Number of infant deaths (thousands)"]]
        inf_dth_df.columns.values[2] = 'value'
        neo_dth_df = self.neo_mort_df[["Country", "Year", "Number of neonatal deaths (thousands)"]]
        neo_dth_df.columns.values[2] = 'value'

        und_fiv_df.loc[:, "Indicator Code"] = "WHO.UND.FIV.DTH"
        und_fiv_df.loc[:, "Indicator Name"] = "Number of under-five deaths (thousands)"
        inf_dth_df.loc[:, "Indicator Code"] = "WHO.INF.DTH"
        inf_dth_df.loc[:, "Indicator Name"] = "Number of infant deaths (thousands)"
        neo_dth_df.loc[:, "Indicator Code"] = "WHO.NEO.DTH"
        neo_dth_df.loc[:, "Indicator Name"] = "Number of neonatal deaths (thousands)"

        self.neo_mort_df = und_fiv_df.append(inf_dth_df, sort="True").append(neo_dth_df, sort="True")
        self.neo_mort_df = self.neo_mort_df.dropna(how='any', axis=0)

        self.df = self.df.append(self.neo_mort_df, sort="False")

    def transform_external_health_expenditure(self):
        self.ext_hlth_exp_df = pd.melt(self.ext_hlth_exp_df,
                                       id_vars=['Country'],
                                       var_name='Year')

        self.ext_hlth_exp_df.loc[:, "Indicator Code"] = "WHO.EXT.HTLTH.EXP"
        self.ext_hlth_exp_df.loc[:, "Indicator Name"] = "External health expenditure (EXT) as percentage of current health expenditure (CHE) (%)"
        self.ext_hlth_exp_df.ix[:, "value"] = self.ext_hlth_exp_df.ix[:, "value"].replace("No data", np.nan)
        self.ext_hlth_exp_df = self.ext_hlth_exp_df.dropna(how='any', axis=0)

        self.df = self.df.append(self.ext_hlth_exp_df, sort="False")

    def transform_out_of_pocket_expenditure(self):
        self.oop_exp_df = pd.melt(self.oop_exp_df,
                                  id_vars=['Country'],
                                  var_name='Year')

        self.oop_exp_df.loc[:, "Indicator Code"] = "WHO.OOP.HLTH.EXP"
        self.oop_exp_df.loc[:, "Indicator Name"] = "Out-of-pocket expenditure as percentage of current health expenditure (CHE) (%)"
        self.oop_exp_df.ix[:, "value"] = self.oop_exp_df.ix[:, "value"].replace("No data", np.nan)
        self.oop_exp_df = self.oop_exp_df.dropna(how='any', axis=0)

        self.df = self.df.append(self.oop_exp_df, sort="False")

    def transform_country_code(self):
        # map country codes
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Eswatini", "Swaziland")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Democratic People's Republic of Korea", "Korea (Democratic People's Republic of)")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Republic of Korea", "Korea (Republic of)")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Republic of Moldova", "Moldova (Republic of)")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("The former Yugoslav republic of Macedonia", "Macedonia (the former Yugoslav Republic of)")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Democratic Republic of the Congo", "Congo (Democratic Republic of the)")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("United Republic of Tanzania", "Tanzania, United Republic of")

        self.df = pd.merge(self.df, self.iso, how='left', left_on='Country', right_on='name')
        self.df.drop(['name', 'country-code'], axis=1, inplace=True)

        # standardize
        self.df.rename(columns={'Year': 'year',
                                'iso3': 'Country Code',
                                'Country': 'Country Name'}, inplace=True)
