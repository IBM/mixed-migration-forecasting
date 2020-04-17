//Base imports
import React from 'react';
import { connect } from 'react-redux';
//Material UI components
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Container from '@material-ui/core/Container';
import LineChart from '../common/charts/LineChart/LineChart';

//Custom components
// import { BarChart, CircleChartComponent } from '../common/charts';
import DahsboardMap from './DashboardMap/DashboardMap';
import BubbleMap from '../Maps/BubbleMap';
import DashboardCountryData from './DashboardCountryData/DashboardCountryData';
import {
  initFilteredDataLoad,
  initMapData,
} from '../../redux/dashboardContent/actions';
import { initIndicatorsLoad } from '../../redux/allIndicators/actions';
import PieChart from '../common/charts/PieChart/PieChart';
import DonutChart from '../common/charts/DonutChart/DonutChart';

//Page styling theme
import dashboardTheme from '../../pages/DashboardOld/Dashboard.theme';

import { initCountryGenDataLoad } from '../../redux/genericCountryData/actions';

import * as i18nIsoCountries from 'i18n-iso-countries';
import BarChart from './../common/charts/BarChart/BarChart';

const useStyles = makeStyles(dashboardTheme);
const DashboardContent = props => {
  const { dashboardContent } = props;
  const classes = useStyles();

  const countryName =
    i18nIsoCountries.getName(
      props.filterStore.selectedCategories.Country[0],
      'en',
    ) || 'Afghanistan';

  const [indicatorNames, setIndicatorNames] = React.useState([]);
  const { genericCountryData } = props;
  const countryCode = Object.keys(genericCountryData)[0];
  React.useEffect(() => {
    props.initMapData();
  }, []);

  React.useEffect(() => {
    props.requestGenericCountryData({
      countryCode: i18nIsoCountries.getAlpha3Code(countryName, 'en'),
    });
    props.initIndicatorsLoad();
  }, []);
  React.useEffect(() => {
    setIndicatorNames(props.indicators);
  }, [props.indicators]);

  return (
    <Container className={classes.container} maxWidth="xl">
      <Grid container spacing={3}>
        {/* Map */}
        <Grid item lg={8} md={12} xs={12}>
          <Paper style={{ minHeight: '550px', padding: '16px' }}>
            {/* <DahsboardMap data={dashboardContent} responsive /> */}
            <BubbleMap data={dashboardContent} responsive />
          </Paper>
        </Grid>
        {/* Charts */}
        <Grid item lg={4} md={12} xs={12}>
          <Paper className={classes.paper}>
            <DashboardCountryData classes={classes} />
            <Grid container spacing={0}>
              <Grid item lg={6}>
                <DonutChart
                  data={genericCountryData[countryCode]}
                  indicatorsList={[
                    'Unemployment, total (% of total labor force) (modeled ILO estimate)',
                  ]}
                  labelsList={['Unemployment', 'Works']}
                  title="Unemployment, total (%)"
                />
              </Grid>
              <Grid item lg={6}>
                <DonutChart
                  data={genericCountryData[countryCode]}
                  indicatorsList={['Population, female (% of total)']}
                  labelsList={['Female', 'Male']}
                  title="Population by gender"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* <Grid item lg={12} md={12} xs={12}>
          <Paper className={classes.paper}>
            {indicatorNames && indicatorNames.length ? (
              <LineChart
                classes={classes}
                countryCode={countryCode}
                currrentCountry={countryName}
                indicatorNames={indicatorNames}
                initIndicator="Internally displaced persons"
              />
            ) : null}
          </Paper>
        </Grid> */}
        {indicatorNames && indicatorNames.length ? (
          <React.Fragment>
            {/* <Grid item lg={6} md={6} xs={12}>
              <Paper className={classes.paper}>
                <PieChart
                  countryCode={countryCode}
                  currrentCountry={countryName}
                  indicatorNames={indicatorNames}
                  initIndicator="Urban population growth (annual %)"
                  isConfig
                />
              </Paper>
            </Grid> */}

            <Grid item lg={6} md={6} xs={12}>
              <Paper className={classes.paper}>
                <LineChart
                  classes={classes}
                  countryCode={countryCode}
                  currrentCountry={countryName}
                  indicatorNames={indicatorNames}
                  initIndicator="State Legitimacy"
                  isConfig
                />
              </Paper>
            </Grid>

            <Grid item lg={6} md={6} xs={12}>
              <Paper className={classes.paper}>
                <BarChart
                  countryCode={countryCode}
                  currrentCountry={countryName}
                  indicatorNames={indicatorNames}
                  initIndicator="Battle-related deaths (number of people)"
                  isConfig
                />
              </Paper>
            </Grid>

            <Grid item lg={6} md={6} xs={12}>
              <Paper className={classes.paper}>
                <BarChart
                  countryCode={countryCode}
                  currrentCountry={countryName}
                  indicatorNames={indicatorNames}
                  initIndicator="GDP per capita, PPP (current international $)"
                  isConfig
                />
              </Paper>
            </Grid>

            <Grid item lg={6} md={6} xs={12}>
              <Paper className={classes.paper}>
                <LineChart
                  classes={classes}
                  countryCode={countryCode}
                  currrentCountry={countryName}
                  indicatorNames={indicatorNames}
                  initIndicator="Unemployment, total (% of total labor force) (modeled ILO estimate)"
                  isConfig
                />
              </Paper>
            </Grid>
          </React.Fragment>
        ) : null}

        {/* <Grid item lg={12} md={12} xs={12}>
          <Paper className={classes.paper}>
            <BarChart
              dashboardContent={dashboardContent}
              title="Victim age by country"
            />
          </Paper>
        </Grid> */}
        {/* Table */}
        {/* <Grid item xs={12}>
          <Paper className={classes.paper}>
            {dashboardContent.isLoading ? (
              <TableSkeleton />
            ) : (
              <Orders dashboardContent={dashboardContent} />
            )}
          </Paper>
        </Grid> */}
      </Grid>
    </Container>
  );
};

const mapStateToProps = state => ({
  filterStore: state.filterStore,
  genericCountryData: state.genericCountryDataStore.countryGenData,
  indicators: state.indicatorsStore.indicators,
});

const mapDispatchToProps = dispatch => {
  return {
    requestGenericCountryData: countryCode =>
      dispatch(initCountryGenDataLoad(countryCode)),
    initFilteredDataLoad: payload => dispatch(initFilteredDataLoad(payload)),
    initMapData: () => dispatch(initMapData()),
    initIndicatorsLoad: () => dispatch(initIndicatorsLoad()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DashboardContent);
