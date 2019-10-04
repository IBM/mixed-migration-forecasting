from .base import Transformer
import pandas as pd
import os

ISO_COUNTRY_CODES = os.path.join(os.path.dirname(__file__), 'countrycodes.csv')


class CorruptionTransformer(Transformer):
    """ Data source specific transformers """
    def __init__(self, source, target):
        super().__init__(source, target)
        self.iso = pd.read_csv(ISO_COUNTRY_CODES,
                               usecols=[0, 2],
                               names=['name', 'iso3'])

    def read(self):

        try:
            self.corr_df = pd.read_csv(self.source, encoding = "ISO-8859-1",
                                        usecols=[ 1, 2, 3])

        except FileNotFoundError as exc:
            raise ValueError("Source file {} not found.".format(self.source)) \
                from exc


    def write(self):
        self.df.to_csv(self.target, mode='w', index=False)



    def transform(self):

        self.transform_corruption_info()
        self.transform_country_code()


    def __repr__(self):
        return "<CorruptionTransformer data for {}-{} ({} rows)>".format(self.df['year'].min(),
                                                                 self.df['year'].max(),
                                                                 len(self.df))


    def transform_corruption_info(self):

        self.corr_df.loc[:, "Indicator Code"] = "DRC.CORR.INDEX"
        self.corr_df.loc[:, "Indicator Name"] = "DRC Collected Corruption Index"


        self.df = self.corr_df


    def transform_country_code(self):

        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("United Kingdom", "United Kingdom of Great Britain and Northern Ireland")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Taiwan", "Taiwan, Province of China")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Czech Republic", "Czechia")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Korea, South", "Korea (Republic of)")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Kosovo", "Serbia")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("CÃ´te dÂ´Ivoire", "Côte d'Ivoire")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Tanzania", "Tanzania, United Republic of")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Macedonia", "Macedonia (the former Yugoslav Republic of)")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Vietnam", "Viet Nam")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Bolivia", "Bolivia (Plurinational State of)")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Moldova", "Moldova (Republic of)")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Iran", "Iran (Islamic Republic of)")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Laos", "Lao People's Democratic Republic")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Russia", "Russian Federation")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Democratic Republic of the Congo", "Congo (Democratic Republic of the)")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Venezuela", "Venezuela (Bolivarian Republic of)")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Korea, North", "Korea (Democratic People's Republic of)")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Guinea Bissau", "Guinea-Bissau")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Syria", "Syrian Arab Republic")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("United States", "United States of America")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Cape Verde", "Cabo Verde")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Korea (South)", "Korea (Republic of)")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Brunei", "Brunei Darussalam")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Macau", "Macao")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Sao Tome & Principe", "Sao Tome and Principe") #
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Congo  Republic", "Congo (Democratic Republic of the)")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Korea (North)", "Korea (Democratic People's Republic of)")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("FYR Macedonia", "Macedonia (the former Yugoslav Republic of)")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Congo-Brazzaville", "Congo")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Taijikistan", "Tajikistan")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Congo. Republic", "Congo (Democratic Republic of the)")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("USA", "United States of America")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Kuweit", "Kuwait")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Moldovaa", "Moldova (Republic of)")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Congo, Republic", "Congo (Democratic Republic of the)")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Cote d'Ivoire", "Côte d'Ivoire")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Congo, Democratic Republic", "Congo (Democratic Republic of the)")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Serbia and Montenegro", "Serbia")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Palestine", "Palestine, State of")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("South Korea", "Korea (Republic of)")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Congo, Republic of", "Congo (Democratic Republic of the)")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Palestinian Authority", "Palestine, State of")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Congo. Republic of", "Congo (Democratic Republic of the)")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Bosnia & Herzegovina", "Bosnia and Herzegovina")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Serbia & Montenegro", "Serbia")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Congo, Republic of the", "Congo (Democratic Republic of the)")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Congo. Democratic Republic", "Congo (Democratic Republic of the)")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Trinidad & Tobago", "Trinidad and Tobago")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Slovak Republic", "Slovakia")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Dominican Rep.", "Dominican Republic")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Congo Brazzaville", "Congo")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Czech Republik", "Czechia")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Democratic Republic of Congo", "Congo (Democratic Republic of the)")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Macedonia (Former Yugoslav Republic of)", "Macedonia (the former Yugoslav Republic of)")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Democratic Republic of the Congo ", "Congo (Democratic Republic of the)")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Cote d´Ivoire", "Côte d'Ivoire")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Côte D'Ivoire", "Côte d'Ivoire")
        self.df.ix[:, "Country"] = self.df.ix[:, "Country"].replace("Côte d´Ivoire", "Côte d'Ivoire")







        self.df = pd.merge(self.df, self.iso, how='left', left_on='Country', right_on='name')
        self.df.drop(['name'], axis=1, inplace=True)

        # standardize
        self.df.rename(columns={
            'iso3': 'Country Code',
            'Year' : 'year',
            'Country': 'Country Name',
            'CPI_score': 'value'}, inplace=True)
