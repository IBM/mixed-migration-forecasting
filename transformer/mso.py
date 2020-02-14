from .base import Transformer
import pandas as pd
import numpy as np
import os
import re


class MyanmarTransformer(Transformer):
    """ Data from the Myanmmar National Statistics Office for a 
    sub-region of Rakhine """

    def __init__(self, source, target):
        super().__init__(source, target)
    
    def read(self):
        self.df = pd.read_excel(self.source)
        self.df.set_index('Unnamed: 0', inplace=True)

    @staticmethod
    def __code(n): 
        """ A short code for each indicator """
        prefix = 'MMR.NSO.'
        return prefix + ''.join([str.upper(s[0]) for s in re.split(r'\s|\(|\)', n) if len(s)>=4])

    def transform(self):
        """ Massage the data """

        self.df = self.df.transpose()
        self.df = self.df.rename_axis('year', axis=0)
        self.df.columns.name = None
        self.df = self.df.apply(pd.to_numeric, errors='coerce')

        # Get indicator codes from column names
        k = self.df.columns.tolist()
        codes = {n: self.__code(n) for n in k}

        data = pd.melt(self.df.reset_index(), id_vars='year')
        data['Country Code'] = 'MMR'
        data['Country Name'] = 'Myanmar'
        data['Indicator Code'] = data['variable'].apply(lambda x: codes[x])

        self.df = data
