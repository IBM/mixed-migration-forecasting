import React from 'react';
// import { Doughnut, Pie } from 'react-chartjs-2';
import { connect } from 'react-redux';
import * as i18nIsoCountries from 'i18n-iso-countries';

import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
// import InputLabel from '@material-ui/core/InputLabel';

import List from '@material-ui/core/List';

import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
// import { CircleChartComponent } from '../../common/charts';
import { Title } from '../../common';
import numeral from 'numeral';

const requiredGenericDataKeys = [
  'Population, total',
  'Population density (people per sq. km of land area)',
  'GDP per capita, PPP (current international $)',
  'Rural population',
  'Urban population',
  'Human Rights',
];

const DashboardCountryData = props => {
  const { classes, genericCountryData } = props;
  const countryCode = Object.keys(genericCountryData)[0];
  const genericData = Object.values(genericCountryData)[0];
  const countryName = i18nIsoCountries.getName(countryCode, 'en');

  return (
    <Grid container>
      {genericData ? (
        <Grid item lg={12} md={12} xs={12}>
          <Title>General Country Information(2014)</Title>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <img
                  src={`https://www.countryflags.io/${i18nIsoCountries.alpha3ToAlpha2(
                    countryCode,
                  )}/shiny/32.png`}
                />
              </ListItemIcon>
              <ListItemText
                primary={`Country: ${countryName}`}
                secondary={''}
              />
            </ListItem>
            {requiredGenericDataKeys.map(el => (
              <ListItem key={el}>
                <ListItemText
                  key={el}
                  primary={`${el}: ${numeral(genericData[el]).format(
                    '0.0[0]a',
                  ) || ''}`}
                  secondary={''}
                />
              </ListItem>
            ))}
          </List>
        </Grid>
      ) : null}
    </Grid>
  );
};

const mapStateToProps = state => {
  return {
    genericCountryData: state.genericCountryDataStore.countryGenData,
  };
};

export default connect(mapStateToProps)(DashboardCountryData);
