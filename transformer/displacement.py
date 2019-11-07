# %%
import os
import pandas as pd
import numpy as np

DATAFOLDER = "../prm-datasets/indicators/"
IDMC_DATA = "Displacement/idmc_displacement_all_dataset.xlsx"
UNHCR_DATA = "Displacement/UNHCR_displacement.csv"

# %%
idmc = pd.read_excel(os.path.join(DATAFOLDER, IDMC_DATA), skiprows=[1])

idmc['idp'] = idmc['Conflict New Displacements'] + idmc['Disaster New Displacements']
print("IDMC data source")
print("Data range: {} -> {}".format(idmc.Year.min(), idmc.Year.max()))
print("Data for {} countries.".format(len(idmc.ISO3.unique())))
print("IDP volumes range: {} -> {}".format(idmc.idp.min(), idmc.idp.max()))

idmc = idmc.rename(columns={'ISO3': 'Country Code', 'Name': 'Country Name', 'Year': 'year', 'idp': 'value'})

idmc['Indicator Code'] = 'IDMC.IDP'
idmc['Indicator Name'] = 'Internally displaced persons'

idmc = idmc[['Country Code', 'Country Name', 'year', 'Indicator Code', 'Indicator Name', 'value']]
idmc.head()

# %%
unhcr = pd.read_csv(os.path.join(DATAFOLDER, UNHCR_DATA), 
        usecols=['Origin', 'iso3', 'Year', 'variable', 'value'])

# Ignore IDP numbers from unhcr
c1 = unhcr.variable.isin(['Refugees', 'Asylum.seekers', 'Others.of.concern'])
unhcr = unhcr[c1]

# Sum things up
unhcr = pd.pivot_table(unhcr, values='value', 
        index = ['Origin', 'iso3', 'Year'], aggfunc=np.sum)
unhcr.reset_index(inplace=True)

print("UNHCR source")
print("Data range: {} -> {}".format(unhcr.Year.min(), unhcr.Year.max()))
print("Data for {} countries.".format(len(unhcr.iso3.unique())))
print("'External displacement' volumes range: {} -> {}".format(unhcr.value.min(), unhcr.value.max()))

unhcr = unhcr.rename(columns={'Origin': 'Country Name', 'iso3': 'Country Code', 'Year': 'year'})
unhcr['Indicator Code'] = 'UNHCR.EDP'
unhcr['Indicator Name'] = 'UNHCR total externally displaced persons'
unhcr.head()
# %%

df = pd.concat([unhcr, idmc], ignore_index=True, sort=False)
df.head()

# %%
