from .base import Transformer
import pandas as pd
import os

PREFIX = {
    "Complex Disasters": "CPX",
    "Natural": "NAT",
    "Technological": "TEC"}


class EMDATTransformer(Transformer):
    """ Data source specific transformers """

    def __init__(self, source, target):
        super().__init__(source, target)

    def read(self):
        """ Overload since encoding is different """

        try:
            self.df = pd.read_csv(self.source, encoding="ISO-8859-1")

        except FileNotFoundError as exc:
            raise ValueError("Source file {} not found.".format(self.source)) \
                from exc

    def transform(self):
        """ Generate features based on each disaster group """
        grouped = self.df.groupby('disaster group', group_keys=False).apply(self.__helper)
        self.df = grouped.dropna()

    @staticmethod
    def __helper(grp):

        # Features in this data
        cols = ['occurrence', 'Total deaths', 'Injured', 'Affected',
                'Homeless', 'Total affected', 'Total damage']

        lbl = grp['disaster group'].unique()[0]
        colnames = {c: "EMDAT.{}.{}".format(PREFIX[lbl], c.replace(" ", ".").upper()) for c in cols}
        indnames = {"EMDAT.{}.{}".format(PREFIX[lbl], c.replace(" ", ".").upper()):
                    "EMDAT estimate of {} for {} disaster group".format(c, lbl) for c in cols}

        k = grp.rename(columns=colnames)
        k.drop(columns="disaster group", inplace=True)

        out = pd.melt(k, id_vars=['year', 'iso', 'country_name'], value_vars=list(colnames.values()))

        out['Indicator Name'] = out['variable'].apply(lambda x: indnames[x])
        out.rename(columns={'iso': 'Country Code',
                            'country_name': "Country Name",
                            'variable': "Indicator Code"}, inplace=True)

        return out

    def __repr__(self):
        return "<EMDATTransformer data for {}-{} ({} rows)>".format(self.df['year'].min(),
                                                                    self.df['year'].max(),
                                                                    len(self.df))
