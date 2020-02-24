
#%% 
import os
import numpy as np
import pandas as pd

DATAFOLDER = "prm-datasets/indicators/"
SP = "Displacement/FDP2008a.csv"

df = pd.read_csv(os.path.join(DATAFOLDER, SP), sep=";")

# fix ISO code / name
df['scode'].replace("MYA", "MMR", inplace=True)
df['country'].replace("Myanmar (Burma)", "Myanmar", inplace=True)

# Value is in '000
df.idp = df.idp * 1000

df.drop(columns=['ccode', 'source', 'host'], inplace=True)
df['Indicator Code'] = 'IDP'
df['Indicator Name'] = 'Internally displaced persons'

df.rename(columns={'country': 'Country Name', 
                'scode': 'Country Code', 
                'idp': 'value'}, inplace=True)
# %%
df.head()
# %%
