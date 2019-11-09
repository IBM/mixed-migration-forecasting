from .base import Transformer
import os
import pandas as pd
import numpy as np
from datetime import datetime

class DisplacementTransformer(Transformer):
    """
    Generates the target forecast variables: Total external displacement and internal displacement

    Two sources:
    UNHCR and IDMC
    """

    def __init__(self, source, target):
        super().__init__(source, target)

    def read(self):
        """ Overloaded method, since we have multiple sources """

        self.idmc = pd.read_excel(self.source[0], skiprows=[1])

        self.unhcr = pd.read_csv(self.source[1],
                                usecols=['Origin', 'iso3', 'Year', 
                                        'variable', 'value'])
        self.sp = pd.read_csv(self.source[2], sep=";")

    def __unhcr_transformer(self):
        """ UNHCR externally displaced populations """

        # Ignore IDP numbers from unhcr
        c1 = self.unhcr.variable.isin(['Refugees', 'Asylum.seekers', 'Others.of.concern'])
        self.unhcr = self.unhcr[c1]

        # Sum things up
        self.unhcr = pd.pivot_table(self.unhcr, values='value', 
                index = ['Origin', 'iso3', 'Year'], aggfunc=np.sum)
        self.unhcr.reset_index(inplace=True)

        # print("UNHCR source")
        # print("Data range: {} -> {}".format(unhcr.Year.min(), unhcr.Year.max()))
        # print("Data for {} countries.".format(len(unhcr.iso3.unique())))
        # print("'External displacement' volumes range: {} -> {}".format(unhcr.value.min(), unhcr.value.max()))

        self.unhcr = self.unhcr.rename(columns={'Origin': 'Country Name', 'iso3': 'Country Code', 'Year': 'year'})
        self.unhcr['Indicator Code'] = 'UNHCR.EDP'
        self.unhcr['Indicator Name'] = 'UNHCR total externally displaced persons'

    def __idmc_transformer(self):
        """ IDMC internally displaced persons since 2008 """

        self.idmc['idp'] = self.idmc['Conflict New Displacements'] + self.idmc['Disaster New Displacements']
        #print("IDMC data source")
        #print("Data range: {} -> {}".format(idmc.Year.min(), idmc.Year.max()))
        #print("Data for {} countries.".format(len(idmc.ISO3.unique())))
        #print("IDP volumes range: {} -> {}".format(idmc.idp.min(), idmc.idp.max()))

        self.idmc = self.idmc.rename(columns={'ISO3': 'Country Code', 
                                    'Name': 'Country Name', 
                                    'Year': 'year', 
                                    'idp': 'value'})

        self.idmc['Indicator Code'] = 'IDP'
        self.idmc['Indicator Name'] = 'Internally displaced persons'
        self.idmc = self.idmc[['Country Code', 'Country Name', 'year', 'Indicator Code', 'Indicator Name', 'value']]

    def __sp_transformer(self):
        """ Systemic Peace dataset till 2008 for IDP"""

        # fix ISO code / name
        self.sp['scode'].replace("MYA", "MMR", inplace=True)
        self.sp['country'].replace("Myanmar (Burma)", "Myanmar", inplace=True)

        # IDP values are in '000
        self.sp.idp = self.sp.idp * 1000

        self.sp.drop(columns=['ccode', 'source', 'host'], inplace=True)
        self.sp['Indicator Code'] = 'IDP'
        self.sp['Indicator Name'] = 'Internally displaced persons'

        self.sp.rename(columns={'country': 'Country Name', 
                        'scode': 'Country Code', 
                        'idp': 'value'}, inplace=True)

    def transform(self):
        """ Transform each of the sources and merge """
        self.__unhcr_transformer()
        self.__idmc_transformer()
        self.__sp_transformer()

        # merge
        self.df = pd.concat([self.unhcr, self.idmc, self.sp], ignore_index=True, sort=False)

