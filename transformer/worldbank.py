from .base import Transformer
import pandas as pd
import numpy as np
import os


class WorldBankTransformer(Transformer):
    """ Data source specific transformers """

    def transform(self):
        """ World bank indicator data transform to long form """

        # Fix separator error in source
        self.df.drop(['Unnamed: 64'], axis=1, inplace=True)

        # Transform the year variables to row-oriented
        wb_df = pd.melt(self.df,
                        id_vars=['Country Name', 'Country Code', 'Indicator Name', 'Indicator Code'],
                        var_name='year')
        wb_df['year'] = wb_df['year'].astype(int)

        # remove nulls and keep only indicators of interest
        ioi = ["VC.BTL.DETH",  #: "Battle related deaths"
               "NY.GDP.PCAP.PP.CD",  # : "GDP per capita
               "SL.UEM.TOTL.ZS",  # Unemployment, total (% of total labor force) (modeled ILO estimate)
               "SL.UEM.TOTL.FE.ZS",  # Unemployment, female (% of female labor force) (modeled ILO estimate)
               "SL.UEM.TOTL.MA.ZS",  # Unemployment, male (% of male labor force) (modeled ILO estimate)
               "ER.H2O.INTR.PC",  #: "Renewable water resources",
               "SI.POV.GINI",  #: "GINI Index" for income distribution
               "SL.UEM.TOT.ZS",  # Total unemployment
               "IT.NET.USER.ZS",  # Individuals Using The Internet (% Of Population)
               # IT.NET.USER.P2", # Internet Users (Per 100 People)
               "SP.DYN.TFRT.IN",  # Fertility rate, total (births per woman)
               "IQ.CPA.PROP.XQ",  # CPIA property rights and rule-based governance rating (1=low to 6=high)
               "SE.ADT.LITR.ZS",  # Literacy rate, adult total (% of people ages 15 and above)
               "AG.PRD.FOOD.XD",  # Food production index (2004-2006 = 100)
               "AG.PRD.LVSK.XD",  # Livestock production index (2004-2006 = 100)
               "SP.URB.GROW",  # Urban population growth (annual %)
               "EN.POP.DNST",  # Population density (people per sq. km of land area)
               "EN.ATM.PM25.MC.M3",  # PM2.5 air pollution, mean annual exposure (micrograms per cubic meter)
               "EG.ELC.ACCS.ZS",  # Access to electricity (% of population)
               "ER.GDP.FWTL.M3.KD",  # Water productivity, total (2010 US$ GDP m3 of total freshwater withdrawal)
               "SP.RUR.TOTL",  # Rural population
               "SP.URB.TOTL",  # Urban population
               "SP.POP.TOTL.FE.ZS",  # Population, female (% of total)
               "SP.POP.DPND",  # Age dependency ratio (% of working-age population)
               "SP.POP.2024.FE.5Y",  # Population ages 20-24, female (% of female population)
               "SP.POP.2024.MA.5Y",  # Population ages 20-24, male (% of male population)
               "SP.POP.2529.FE.5Y",  # Population ages 25-29, female (% of female population)
               "SP.POP.2529.MA.5Y",  # Population ages 25-29, male (% of male population)
               "FP.CPI.TOTL.ZG",  # Inflation, consumer prices
               "CC.EST",  # Control of corruption
               "GE.EST", # Government effectiveness
               "SP.POP.TOTL"]  #: "Total Population"

        c1 = ~wb_df['value'].isnull()
        c2 = wb_df['Indicator Code'].isin(ioi)

        wb_df = wb_df[c1 & c2]
        self.df = wb_df

    def __repr__(self):
        return "<WorldBankTransformer data for {}-{} ({} rows)>".format(self.df['year'].min(),
                                                                        self.df['year'].max(),
                                                                        len(self.df))
