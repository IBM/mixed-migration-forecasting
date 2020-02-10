from transformer.base import Transformer
import pandas as pd
import numpy as np
import os

ISO_COUNTRY_CODES = os.path.join(os.path.dirname(__file__), 'countrycodes.csv')


class FoodTransformer(Transformer):
    """ Data source specific transformers """

    def __init__(self, source, target):
        super().__init__(source, target)
        self.iso = pd.read_csv(ISO_COUNTRY_CODES,
                               usecols=[0, 2],
                               names=['name', 'iso3'],
                               header=0)

    def read(self):

        try:
            self.avg_dietary_df = pd.read_excel(self.source, sheet_name="I_1.1", skiprows=2,
                                                  usecols="C:U")
            self.prevalence_df = pd.read_excel(self.source, sheet_name="I_2.5", skiprows=2,
                                                usecols="C:F")


            #self.mat_dth_df = pd.read_csv(self.source[0],
             #                             usecols=[0, 1, 3])



        except FileNotFoundError as exc:
            raise ValueError("Source file {} not found.".format(self.source)) \
                from exc

    def write(self):
        self.df.to_csv(self.target, mode='w', index=False)

    def transform_dietary(self):
        #df = pd.DataFrame(columns=["Country Name","Indicator Name","Indicator Code","year","value"])
        df = pd.melt(self.avg_dietary_df, id_vars='Regions.Subregions.Countries', var_name='year', value_name='value')
        df = df.rename(columns={"Regions.Subregions.Countries": "country"})
        df["year"] = df["year"].str[:4]
        df["Indicator Name"] = "Average dietary energy supply adequacy"
        df["Indicator Code"] = "ADESA"
        self.avg_dietary_df = df

    def transform_prevalence(self):
        df = pd.melt(self.prevalence_df, id_vars='Regions.Subregions.Countries', var_name='year', value_name='value')
        df = df.rename(columns={"Regions.Subregions.Countries": "country"})
        df["year"] = df["year"].apply(lambda x : int(2000+(int(x[2:4])+int(x[5:7]))/2))
        df["Indicator Name"] = "Prevalence of moderate or severe food insecurity in the total population, 3-year averages"
        df["Indicator Code"] = "POMOSFI"
        self.prevalence_df = df

    def transform(self):
        # self.transform_forcibly_displaced_populations()
        self.transform_dietary()
        self.transform_prevalence()
        # self.df = self.avg_dietary_df.append(self.prevalence_df, sort="True")
        self.df = self.avg_dietary_df

        self.df = self.df.dropna(how='any', axis=0)

        self.transform_country_code()

    def __repr__(self):
        return "FoodTransformer data for {}-{} ({} rows)>".format(self.df['year'].min(),
                                                                     self.df['year'].max(),
                                                                     len(self.df))





    def transform_country_code(self):
        # map country codes
        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("United States", "United States of America")
        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("Trinidad & Tobago", "Trinidad and Tobago")
        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("Venezuela", "Venezuela (Bolivarian Republic of)")
        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("Bolivia", "Bolivia (Plurinational State of)")
        self.df.ix[:, "country"] = self.df.ix[:, "country"].replace("United Kingdom",
                                                                    "United Kingdom of Great Britain and Northern Ireland")
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


#if __name__ == '__main__':
#    pd.set_option('display.max_rows', 500)
#    pd.set_option('display.max_columns', 500)
#    pd.set_option('display.width', 1000)
#    ft = FoodTransformer(r"D:\Displacement forecasting\Food_Security_Indicators_1Oct2019.xlsx",r"D:\Displacement forecasting\data.csv")
#    ft.read()
#    ft.transform()
#    print(ft.df.head(20))