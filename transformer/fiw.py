from .base import Transformer
import pandas as pd
import numpy as np
import os

ISO_COUNTRY_CODES = os.path.join(os.path.dirname(__file__), 'countrycodes.csv')

class FreedomTransformer(Transformer):
    """ Data source specific transformers """

    def __init__(self, source, target):
        super().__init__(source, target)
        self.iso = pd.read_csv(ISO_COUNTRY_CODES,
                               usecols=[0, 2],
                               names=['name', 'iso3'],
                               header=0)

    def transform(self):
        """
            Freedom In the World (FIW) indicator data transformer
            Data Source: https://freedomhouse.org/content/freedom-world-data-and-resources
            Download the "Country and Territory Ratings and Statuses" spreadsheet
            Save as csv
            Transform
        """
        # remove the first header row
        years = self.df.iloc[0]
        indicators = self.df.iloc[1]
        indicators['Survey Edition'] = 'Country Name'
        self.df = self.df.iloc[2:]
        self.df.columns = indicators
        self.df.rename(columns={'CL ':'CL'}, inplace=True)
        fdf = pd.DataFrame()
        j = 1
        years.dropna(inplace=True)
        years = years[1:]
        # create a new dataframe with necessary data only
        for key, year in years.items():
            fdf = fdf.append([self.df.iloc[:, [0, j, j+1, j+2]].assign(year=str(year)[-4:])], sort=False)
            j+=3
        # print(fdf)
        self.df = fdf
        # pivot
        self.df = pd.melt(self.df,
                            id_vars = ['Country Name', 'year'],
                            value_vars = ['PR', 'CL'],
                            var_name = 'Indicator Code',
                            value_name = 'value')
        # force numeric values
        self.df['value'] = pd.to_numeric(self.df['value'], errors='coerce')
        # remove rows with empty values
        self.df.replace(to_replace='-', value=np.NaN, inplace=True)
        self.df.dropna(inplace=True)
        # merge with country codes
        self.transform_country_code()
        # merge with indicator names
        inames = pd.DataFrame([['PR', 'Political Rights'], ['CL', 'Civil Liberties'], ['Status', 'Freedom Status']], columns=['Indicator Code', 'Indicator Name'])
        self.df = pd.merge(self.df, inames, how='left', left_on='Indicator Code', right_on='Indicator Code')
        # rename indicator values
        self.df.replace(to_replace=['PR', 'CL', 'Status'], value=['FIW.PR', 'FIW.CL', 'FIW.Status'], inplace=True)
        # order columns
        self.df = self.df[['Indicator Code', 'Indicator Name', 'Country Code', 'Country Name', 'value', 'year']]

    def transform_country_code(self):
        # map country codes
        self.df.ix[:, "Country Name"] = self.df.ix[:, "Country Name"].replace("Eswatini","Swaziland")
        self.df.ix[:, "Country Name"] = self.df.ix[:, "Country Name"].replace("Democratic People's Republic of Korea", "Korea (Democratic People's Republic of)")
        self.df.ix[:, "Country Name"] = self.df.ix[:, "Country Name"].replace("Republic of Korea", "Korea (Republic of)")
        self.df.ix[:, "Country Name"] = self.df.ix[:, "Country Name"].replace("Republic of Moldova", "Moldova (Republic of)")
        self.df.ix[:, "Country Name"] = self.df.ix[:, "Country Name"].replace("The former Yugoslav republic of Macedonia", "Macedonia (the former Yugoslav Republic of)")
        self.df.ix[:, "Country Name"] = self.df.ix[:, "Country Name"].replace("Democratic Republic of the Congo", "Congo (Democratic Republic of the)")
        self.df.ix[:, "Country Name"] = self.df.ix[:, "Country Name"].replace("United Republic of Tanzania", "Tanzania, United Republic of")
        self.df.ix[:, "Country Name"] = self.df.ix[:, "Country Name"].replace("Bolivia", "Bolivia (Plurinational State of)")
        self.df.ix[:, "Country Name"] = self.df.ix[:, "Country Name"].replace("Brunei", "Brunei Darussalam")
        self.df.ix[:, "Country Name"] = self.df.ix[:, "Country Name"].replace("Cape Verde", "Cabo Verde")
        self.df.ix[:, "Country Name"] = self.df.ix[:, "Country Name"].replace("Congo (Brazzaville)", "Congo")
        self.df.ix[:, "Country Name"] = self.df.ix[:, "Country Name"].replace("Congo (Kinshasa)", "Congo")
        self.df.ix[:, "Country Name"] = self.df.ix[:, "Country Name"].replace("Cote d'Ivoire", "Côte d'Ivoire")
        self.df.ix[:, "Country Name"] = self.df.ix[:, "Country Name"].replace("Northern Cyprus", "Cyprus")
        self.df.ix[:, "Country Name"] = self.df.ix[:, "Country Name"].replace("Czechoslovakia", "Czechia")
        self.df.ix[:, "Country Name"] = self.df.ix[:, "Country Name"].replace("Czech Republic", "Czechia")
        self.df.ix[:, "Country Name"] = self.df.ix[:, "Country Name"].replace("Germany, E. ", "Germany")
        self.df.ix[:, "Country Name"] = self.df.ix[:, "Country Name"].replace("Germany, W. ", "Germany")
        self.df.ix[:, "Country Name"] = self.df.ix[:, "Country Name"].replace("Iran", "Iran (Islamic Republic of)")
        self.df.ix[:, "Country Name"] = self.df.ix[:, "Country Name"].replace("Laos", "Lao People's Democratic Republic")
        self.df.ix[:, "Country Name"] = self.df.ix[:, "Country Name"].replace("Macedonia", "Macedonia (the former Yugoslav Republic of)")
        self.df.ix[:, "Country Name"] = self.df.ix[:, "Country Name"].replace("Micronesia", "Micronesia (Federated States of)")
        self.df.ix[:, "Country Name"] = self.df.ix[:, "Country Name"].replace("Moldova", "Moldova (Republic of)")
        self.df.ix[:, "Country Name"] = self.df.ix[:, "Country Name"].replace("North Korea", "Korea (Democratic People's Republic of)")
        self.df.ix[:, "Country Name"] = self.df.ix[:, "Country Name"].replace("South Korea", "Korea (Republic of)")
        self.df.ix[:, "Country Name"] = self.df.ix[:, "Country Name"].replace("St. Kitts and Nevis", "Saint Kitts and Nevis")
        self.df.ix[:, "Country Name"] = self.df.ix[:, "Country Name"].replace("St. Lucia", "Saint Lucia")
        self.df.ix[:, "Country Name"] = self.df.ix[:, "Country Name"].replace("St. Vincent and the Grenadines", "Saint Vincent and the Grenadines")
        self.df.ix[:, "Country Name"] = self.df.ix[:, "Country Name"].replace("Syria", "Syrian Arab Republic")
        self.df.ix[:, "Country Name"] = self.df.ix[:, "Country Name"].replace("Taiwan", "Taiwan, Province of China")
        self.df.ix[:, "Country Name"] = self.df.ix[:, "Country Name"].replace("Tanzania", "Tanzania, United Republic of")
        self.df.ix[:, "Country Name"] = self.df.ix[:, "Country Name"].replace("The Gambia", "Gambia")
        self.df.ix[:, "Country Name"] = self.df.ix[:, "Country Name"].replace("United Kingdom", "United Kingdom of Great Britain and Northern Ireland")
        self.df.ix[:, "Country Name"] = self.df.ix[:, "Country Name"].replace("United States", "United States of America")
        self.df.ix[:, "Country Name"] = self.df.ix[:, "Country Name"].replace("USSR", "Russian Federation")
        self.df.ix[:, "Country Name"] = self.df.ix[:, "Country Name"].replace("Russia", "Russian Federation")
        self.df.ix[:, "Country Name"] = self.df.ix[:, "Country Name"].replace("Venezuela", "Venezuela (Bolivarian Republic of)")
        self.df.ix[:, "Country Name"] = self.df.ix[:, "Country Name"].replace("Vietnam, N.", "Viet Nam")
        self.df.ix[:, "Country Name"] = self.df.ix[:, "Country Name"].replace("Vietnam, S.", "Viet Nam")
        self.df.ix[:, "Country Name"] = self.df.ix[:, "Country Name"].replace("Vietnam", "Viet Nam")
        self.df.ix[:, "Country Name"] = self.df.ix[:, "Country Name"].replace("Yemen, N.", "Yemen")
        self.df.ix[:, "Country Name"] = self.df.ix[:, "Country Name"].replace("Yemen, S.", "Yemen")
        self.df.ix[:, "Country Name"] = self.df.ix[:, "Country Name"].replace("Yugoslavia", "Serbia")
        self.df.ix[:, "Country Name"] = self.df.ix[:, "Country Name"].replace("Yugoslavia (Serbia & Montenegro)", "Serbia")

        self.df = pd.merge(self.df, self.iso, how='left', left_on='Country Name', right_on='name')
        self.df.rename(columns={'iso3': 'Country Code'}, inplace=True)
        self.df.drop(['name'], axis=1, inplace=True)

    def __repr__(self):
        return "<FreedomTransformer data for {}-{} ({} rows)>".format(self.df['year'].min(),
                                                                        self.df['year'].max(),
                                                                        len(self.df))
