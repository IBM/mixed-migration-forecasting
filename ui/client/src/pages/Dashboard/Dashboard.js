//Base imports
import React from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { A } from 'hookrouter';

//Material UI components
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';

//Custom components
import ScatterChart from '../../components/common/charts/ScatterChart';
import { SubTitle } from '../../components/common';
import ForecastSlider from '../../components/ForecastSlider/ForecastSlider';
import DashboardMap from '../../components/Maps/MapboxDashboard';
import HomeDataTrends from '../../components/HomePageSearch/HomeData/HomeDataTrends';
import LineChart from '../../components/common/charts/LineChart/LineChart';
import SparklineChart from '../../components/common/charts/SparklineChart/SparklineChart';
import BarChart from '../../components/common/charts/BarChart/BarChart';
import KPICard from '../../components/common/KPICard/KPICard';

import InfoIcon from '@material-ui/icons/Info';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import RemoveIcon from '@material-ui/icons/Remove';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';

//Page styling theme
import fxTheme from './Dashboard.theme';

import {
  initForecastDataLoad,
  initUserForecastDataLoad,
} from '../../redux/homepageForecast/actions';
import { initIndicatorsLoad } from '../../redux/allIndicators/actions';
import { initMapDataLoad } from '../../redux/mapContent/actions';
import { saveSarImage } from '../../redux/sar/actions';
import { initDataTrendsLoad } from '../../redux/homepageDataTrends/actions';
import { selectCategories } from '../../redux/dashboardFilter/actions';
import { initCountryGenDataLoad } from '../../redux/genericCountryData/actions';

import * as i18nIsoCountries from 'i18n-iso-countries';
import CountryDataInTable from '../../components/common/ChartDataInTable/CountryDatainTable';
import DashboardIndSearch from '../../components/DashboardContent/DashboardSearch/DashboardIndSearch';
import numeral from 'numeral';
import Skeleton from 'react-loading-skeleton';

const useStyles = makeStyles(fxTheme);

const generateMarkerData = data => {
  const markersArray = [];
  if (Object.keys(data).length) {
    const yearsArray = Object.keys(data.victimsList);
    const currentData = data.victimsList[yearsArray[yearsArray.length - 1]];
    currentData
      .filter(
        el =>
          // el.latitude >= -90 &&
          // el.latitude <= 90 &&
          el.longitude >= -90 && el.longitude <= 90,
      )
      .map(element => {
        markersArray.push({
          lat: element.longitude,
          lon: element.latitude,
          text: element.yeild,
          name: element.name,
          country: element.country,
        });
      });
  }
  return markersArray;
};

const generateCountryIndData = (data, countryCode) => {
  const tempData = [];
  if (Object.keys(data).length) {
    const yearsArray = Object.keys(data.victimsList);
    for (let year of yearsArray) {
      if (data.victimsList[year] && data.victimsList[year].length) {
        tempData.push({
          ...data.victimsList[year].filter(el => el.country === countryCode)[0],
          year: year,
        });
      }
    }
  }
  return tempData;
};

const Dashboard = props => {
  i18nIsoCountries.registerLocale(require('i18n-iso-countries/langs/en.json'));
  const classes = useStyles();
  const { homepageDataTrends, countryCode, indicatorNames } = props;
  const [currentInd, setCurrentInd] = React.useState(
    'Total forced displacement',
  );
  const [conflictInd, setConflictInd] = React.useState('average');
  const [economicInd, setEconomicInd] = React.useState('average');
  const [climateInd, setClimateInd] = React.useState('average');
  const [corruptionInd, setCorruptionInd] = React.useState('average');
  const countryName =
    i18nIsoCountries.getName(countryCode, 'en') || 'Afghanistan';

  // const userForecastRequest = () => {
  //   props.initUserForecastDataLoad({
  //     country: countryCode,
  //     countries: countryCode,
  //     year: '2019',
  //     years: '2010-2019',
  //     indicators: 'IDP,UNHCR.EDP',
  //   });
  // };

  React.useEffect(() => {
    props.initMapDataLoad();
    props.initIndicatorsLoad();
    props.initDataTrendsLoad({
      countries: countryCode,
      yearRange: '2010-2019',
    });
  }, []);

  const mapByIndicatorsRequest = indicatorName => {
    setCurrentInd(indicatorName);
    props.initMapDataLoad({
      indicator: indicatorName,
    });
  };

  // const saveRef = async () => {
  //   let imageDataString = null;
  //   try {
  //     const homePageSar = document.getElementById('sar-container');
  //     const htmlCanvas = await html2canvas(homePageSar, {
  //       useCORS: true,
  //       logging: false,
  //     });
  //     imageDataString = htmlCanvas.toDataURL();
  //     props.passSavedSarImage(imageDataString);
  //   } catch (error) {
  //     console.log('[imageDataString] Err:', error);
  //   }
  // };
  const countryDataArray = generateCountryIndData(props.mapData, countryCode);
  let indValueChange = 0;
  if (countryDataArray.length > 1) {
    const currentVal = countryDataArray[countryDataArray.length - 1].yeild || 0;
    const prevVal = countryDataArray[countryDataArray.length - 2].yeild || 0;
    indValueChange = currentVal - prevVal;
  }
  return (
    <section className={classes.root} id={'sar-container'}>
      {/* NOTE: might be separated in further development */}
      <Container className={classes.container} maxWidth="xl">
        <Grid container spacing={3}>
          <Grid item lg={3} md={6} xs={12}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <KPICard
                  classes={classes}
                  countryDataArray={countryDataArray}
                  countryName={countryName}
                  currentInd={currentInd}
                />
                {/* <Paper className={classes.paper}>
                  <Typography
                    align="center"
                    color="primary"
                    component="h6"
                    style={{ color: '#cc051f' }}
                    variant="h6"
                  >
                    Total <q>{currentInd}</q> count for {countryName}
                  </Typography>
                  <Typography align="center" component="h3" variant="h3">
                    {numeral(
                      countryDataArray
                        .map(el => (el ? el.yeild : 0))
                        .reduce((a, b) => {
                          const x = a || 0;
                          const y = b || 0;
                          return x + y;
                        }, 0),
                    ).format('0.0[0]a')}
                  </Typography>
                  <Typography
                    align="center"
                    color="primary"
                    component="h6"
                    style={{ color: '#cc051f' }}
                    variant="h6"
                  >
                    Latest <q>{currentInd}</q> count for {countryName}
                  </Typography>
                  <Typography align="center" component="h3" variant="h3">
                    {numeral(
                      countryDataArray[countryDataArray.length - 1]
                        ? countryDataArray[countryDataArray.length - 1].yeild
                        : 0,
                    ).format('0.0[0]a')}
                  </Typography>
                </Paper> */}
              </Grid>
              <Grid item xs={12}>
                <Paper
                  className={classes.paper}
                  style={{ backgroundColor: '#3c3d41' }}
                >
                  <SubTitle style={{ color: '#fff' }}>
                    {currentInd} (
                    {countryDataArray[countryDataArray.length - 1]
                      ? countryDataArray[countryDataArray.length - 1].year
                      : ''}
                    )
                  </SubTitle>
                  <CountryDataInTable
                    data={generateMarkerData(props.mapData).sort(
                      (a, b) => b.text - a.text,
                    )}
                    indicatorName={currentInd}
                    year={
                      countryDataArray[countryDataArray.length - 1]
                        ? countryDataArray[countryDataArray.length - 1].year
                        : 'N/A'
                    }
                  />
                </Paper>
              </Grid>
            </Grid>
          </Grid>
          <Grid item lg={6} md={6} xs={12}>
            <Paper
              className={classes.paper}
              style={{ backgroundColor: '#666' }}
            >
              <SubTitle style={{ color: '#fff' }}>
                {currentInd} (
                {countryDataArray[countryDataArray.length - 1]
                  ? countryDataArray[countryDataArray.length - 1].year
                  : ''}
                )
                <Tooltip
                  title={
                    <div style={{ fontSize: '1rem', lineHeight: '1.3rem' }}>
                      <h3>Component info:</h3>
                      The Map control visualization displays the {
                        currentInd
                      }{' '}
                      data for the most recent year available in the systemby
                      country. The Map control includes an option to select a
                      specific country by clicking within its map boundary, to
                      zoom in & out in the map and theability to hover over a
                      country ‘bubble’ for additional information. The countries
                      for which forecasts are available are highlighted in
                      yellow and the currently selected country is highlighted
                      in red.
                      <h3>Interaction info:</h3>
                      This control interacts with the Forecast control to alter
                      the forecast based on country selected in the Map.
                    </div>
                  }
                  arrow
                >
                  <Button
                    style={{
                      color: '#fbc02d',
                      padding: '0',
                      minWidth: 'unset',
                      marginLeft: '5px',
                    }}
                  >
                    <InfoIcon />
                  </Button>
                </Tooltip>
              </SubTitle>
              {props.isMapDataLoading ? (
                <Skeleton height="40rem" width="100%" />
              ) : (
                <DashboardMap
                  genericCountryData={props.genericCountryData}
                  getDataByCountry={props.initDataTrendsLoad}
                  getForecastByCountry={props.initForecastDataLoad}
                  getGenericCountryData={props.initCountryGenDataLoad}
                  markersData={generateMarkerData(props.mapData)}
                  countryName={countryName}
                  updateSelectedCountry={props.passSelectedCountry}
                />
              )}
            </Paper>
          </Grid>
          <Grid item lg={3} md={6} xs={12}>
            <DashboardIndSearch
              countryName={countryName}
              dataTrends={
                homepageDataTrends[Object.keys(homepageDataTrends)[0]]
              }
              dense
              onItemClick={mapByIndicatorsRequest}
            />
          </Grid>
          <Grid item lg={3} md={12} xs={12}>
            <Paper className={classes.paper}>
              <LineChart
                classes={classes}
                countryCode={countryCode}
                currrentCountry={countryName}
                indicatorNames={indicatorNames}
                initIndicator="Fragile States Index: State Legitimacy (0-10, where 10 is the most fragile)"
                isConfig
                short
              />
            </Paper>
          </Grid>
          <Grid item lg={6} md={6} xs={12}>
            <Paper className={classes.paper}>
              <SparklineChart
                backgroundColor="#fff"
                classes={classes}
                countryCode={countryCode}
                currrentCountry={countryName}
                indicatorNames={indicatorNames}
                initIndicator={currentInd}
                isConfig
                short
                showFullDataSet
              />
            </Paper>
          </Grid>
          <Grid item lg={3} md={6} xs={12}>
            <Paper className={classes.paper}>
              <BarChart
                countryCode={countryCode}
                currrentCountry={countryName}
                indicatorNames={indicatorNames}
                initIndicator="Battle-related deaths (number of people)"
                isConfig
                short
              />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </section>
  );
};

const mapStateToProps = state => ({
  homepageDataTrends: state.homepageDataTrendsStore.dataTrends,
  countryCode: state.filterStore.selectedCategories.Country[0],
  mapData: state.mapStore.mapData,
  isMapDataLoading: state.mapStore.isLoading,
  indicatorNames: state.indicatorsStore.indicators,
  genericCountryData: state.genericCountryDataStore.countryGenData,
});

const mapDispatchToProps = dispatch => {
  return {
    initForecastDataLoad: data => dispatch(initForecastDataLoad(data)),
    initUserForecastDataLoad: requestParams =>
      dispatch(initUserForecastDataLoad(requestParams)),
    initDataTrendsLoad: requestBody =>
      dispatch(initDataTrendsLoad(requestBody)),
    initDataTrendsMetaLoad: requestBody =>
      dispatch(initDataTrendsLoad(requestBody)),
    initMapDataLoad: requestBody => dispatch(initMapDataLoad(requestBody)),
    passSelectedCountry: selectedCategories =>
      dispatch(selectCategories(selectedCategories)),
    passSavedSarImage: imageURL => dispatch(saveSarImage(imageURL)),
    initIndicatorsLoad: () => dispatch(initIndicatorsLoad()),
    initCountryGenDataLoad: requestBody =>
      dispatch(initCountryGenDataLoad(requestBody)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
