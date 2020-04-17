//Base imports
import React from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { A } from 'hookrouter';
import axios from 'axios';

//Material UI components
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import InfoIcon from '@material-ui/icons/Info';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import Tooltip from '@material-ui/core/Tooltip';
import Skeleton from 'react-loading-skeleton';

//Custom components
import ScatterChart from '../../components/common/charts/ScatterChart';
import { Title } from '../../components/common';
import ForecastSlider from './../../components/ForecastSlider/ForecastSlider';
import HomeMap from '../../components/Maps/MapboxHome';
import HomeDataTrends from '../../components/HomePageSearch/HomeData/HomeDataTrends';

//Page styling theme
import homeTheme from './Home.theme';

import {
  initForecastDataLoad,
  initUserForecastDataLoad,
  finishUserForecastDataLoad,
} from './../../redux/homepageForecast/actions';
import { initMapDataLoad } from '../../redux/mapContent/actions';
import { initScenarioDataLoad } from '../../redux/homepageScenario/actions';
import { saveSarImage } from '../../redux/sar/actions';
import { initDataTrendsLoad } from '../../redux/homepageDataTrends/actions';
import { selectCategories } from '../../redux/dashboardFilter/actions';
import Typography from '@material-ui/core/Typography';

import * as i18nIsoCountries from 'i18n-iso-countries';
import ReactHtmlParser from 'react-html-parser';

const useStyles = makeStyles(homeTheme);

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
          el.longitude >= -90 && el.longitude <= 90 && el.yeild >= 1000,
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

const HomePage = props => {
  i18nIsoCountries.registerLocale(require('i18n-iso-countries/langs/en.json'));
  const classes = useStyles();
  const { homepageDataTrends, countryCode, homepageForecastData } = props;
  const [scenarioVals, setScenarioVals] = React.useState({});
  const countryName =
    i18nIsoCountries.getName(countryCode, 'en') || 'Afghanistan';

  const userForecastRequest = () => {
    props.initUserForecastDataLoad({
      source: countryCode,
      ...scenarioVals,
    });
    window.scrollTo(0, 0);
  };

  const [availableCountries, setAvailableCountries] = React.useState([]);
  React.useEffect(() => {
    const tempFunc = async () => {
      const countries = await axios({
        method: 'get',
        url: '/api/available-countries',
        headers: {},
      });
      setAvailableCountries(countries.data.map(el => el['Country Name']));
    };
    tempFunc();
  }, {});

  React.useEffect(() => {
    props.initForecastDataLoad({
      source: countryCode,
      countries: countryCode,
      year: '2019',
      years: '2010-2019',
      indicators: 'DRC.TOT.DISP',
    });
    props.initDataTrendsLoad({
      countries: countryCode,
      yearRange: '2010-2019',
    });
    props.initMapDataLoad();
    props.initScenarioDataLoad();
  }, []);

  const saveRef = async () => {
    let imageDataString = null;
    try {
      const homePageSar = document.getElementById('sar-container');
      const htmlCanvas = await html2canvas(homePageSar, {
        useCORS: true,
        logging: false,
      });
      imageDataString = htmlCanvas.toDataURL();
      props.passSavedSarImage(imageDataString);
    } catch (error) {
      console.log('[imageDataString] Err:', error);
    }
  };

  const updateScenarioVals = (claster, value) => {
    let tempScenario = { ...scenarioVals };
    tempScenario[claster] = value;
    if (value === 'NC') {
      delete tempScenario[claster];
    }
    setScenarioVals(tempScenario);
  };

  const countryDataArray = generateCountryIndData(props.mapData, countryCode);
  const { labels, clusters } = props.scenarioData;
  return (
    <section className={classes.root} id={'sar-container'}>
      {/* NOTE: might be separated in further development */}
      <Container className={classes.container} maxWidth="xl">
        <Grid container spacing={3}>
          <Grid item lg={6} md={12} xs={12}>
            <Paper
              className={classes.paper}
              style={{ backgroundColor: '#666' }}
            >
              <Title style={{ color: '#fff' }}>
                Total forced displacement (
                {countryDataArray[countryDataArray.length - 1]
                  ? countryDataArray[countryDataArray.length - 1].year
                  : ''}
                )
                <Tooltip
                  title={
                    <div style={{ fontSize: '1rem', lineHeight: '1.3rem' }}>
                      <h3>Component info:</h3>
                      The Map control visualization displays the Total Forced
                      Displacement data count for the most recent year available
                      in the systemby country. The Map control includes an
                      option to select a specific country by clicking within its
                      map boundary, to zoom in & out in the map and theability
                      to hover over a country ‘bubble’ for additional
                      information. The countries for which forecasts are
                      available are highlighted in yellow and the currently
                      selected country is highlighted in red.
                      <h3>Interaction info:</h3>
                      This control interacts with the Forecast control to alter
                      the forecast based on country selected in the Map.
                    </div>
                  }
                  arrow
                >
                  <Button
                    style={{
                      padding: '0',
                      minWidth: 'unset',
                      marginLeft: '5px',
                      color: '#fbc02d',
                    }}
                  >
                    <InfoIcon />
                  </Button>
                </Tooltip>
              </Title>
              {props.isMapDataLoading ? (
                <Skeleton height="400px" width="100%" />
              ) : (
                <HomeMap
                  getDataByCountry={props.initDataTrendsLoad}
                  getForecastByCountry={props.initForecastDataLoad}
                  markersData={generateMarkerData(props.mapData)}
                  countryName={countryName}
                  updateSelectedCountry={props.passSelectedCountry}
                  clearUserForecastData={props.clearUserForecastData}
                />
              )}
            </Paper>
          </Grid>
          <Grid item lg={6} md={12} xs={12}>
            <Paper
              className={classes.paper}
              style={{ backgroundColor: '#ddd' }}
            >
              <Grid container justify={'space-between'}>
                <Title>
                  Forecast
                  {availableCountries.includes(countryName)
                    ? ''
                    : ' unavailable'}{' '}
                  for {countryName}
                  <Tooltip
                    title={
                      <div style={{ fontSize: '1rem', lineHeight: '1.3rem' }}>
                        <h3>Component info:</h3>
                        The Forecast control visualization by default displays
                        the observed & predicted values for Total Forced
                        Displacement based onthe country selected in the map.
                        The graph displays the observed (historical) data by
                        year for the country selected as blue dots, the system
                        generated forecast for the projected period (3-5 years)
                        as red squares and the confidence interval for the
                        prediction (min & max) as a green shaded area. The graph
                        can also display a “user forecast” as a yellow triangle
                        which is based on the on the Scenario cluster settings
                        selected by the user in the Scenario what if’s control.{' '}
                        <br />
                        <br /> It is also possible for the user to create a
                        Situational Report (SIT REP) from the Home page
                        selections by clicking on the red button labelled
                        “Create a Report”.
                        <h3>Interaction info:</h3>
                        This control interacts with the Map control to base the
                        forecast generated on the country selected and the
                        Scenario what if’scontrol to generate a “user forecast”
                        based on the Scenario cluster settings selected.
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
                </Title>
                <A href={'/analysis-report'} style={{ textDecoration: 'none' }}>
                  <Button
                    color="primary"
                    onClick={saveRef}
                    size="small"
                    style={{ backgroundColor: '#cc051f' }}
                    variant="contained"
                  >
                    Create a Report
                  </Button>
                </A>
              </Grid>
              <ScatterChart />
            </Paper>
          </Grid>
          <Grid item lg={6} md={12} xs={12}>
            <HomeDataTrends
              countryName={countryName}
              dataTrends={
                homepageDataTrends[Object.keys(homepageDataTrends)[0]]
              }
              size={2.2}
            />
          </Grid>
          <Grid item lg={6} md={12} xs={12}>
            <Paper className={classes.paper} style={{ marginBottom: '1.5rem' }}>
              <Title>
                <Box className={classes.header}>
                  <Box>
                    Scenario what if's
                    <Tooltip
                      title={
                        <div style={{ fontSize: '1rem', lineHeight: '1.3rem' }}>
                          <h3>Component info:</h3>
                          The Scenario what if’s control can be used by the user
                          to generate a “user forecast” in the Forecast control.
                          There are five clusters within the Scenario what if’s
                          control which can be adjusted using the slider
                          provided for each cluster to reflect the users view of
                          what might happen, when the user has completed the
                          adjustments to these clusters a new “user forecast”
                          can be generated in the Forecast control by clicking
                          the “Forecast” button.
                          <h3>Interaction info:</h3>
                          This control interacts with the Map control to select
                          a country and the Forecast control to generate a “user
                          forecast” based on the Scenario cluster settings
                          selected.
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
                  </Box>
                  <Box>
                    <Button
                      color="primary"
                      onClick={userForecastRequest}
                      size="small"
                      style={{ backgroundColor: '#cc051f' }}
                      variant="contained"
                    >
                      Forecast
                    </Button>
                  </Box>
                </Box>
              </Title>
              <Grid container>
                {clusters.map(cluster => (
                  <Grid key={cluster.theme} item md={6} xs={12}>
                    <ForecastSlider
                      handleChange={value =>
                        updateScenarioVals(cluster.theme, value)
                      }
                      title={cluster.theme}
                      value={scenarioVals[cluster.theme] || 'NC'}
                      tempMarks={cluster.labels.map((el, i) => {
                        return {
                          value: (100 / (cluster.labels.length - 1)) * i,
                          label: el,
                        };
                      })}
                    />
                  </Grid>
                ))}
              </Grid>
            </Paper>
            <Paper
              className={classes.paper}
              style={{ backgroundColor: '#ddd' }}
            >
              <Title>
                Model explanations
                <Tooltip
                  title={
                    <div style={{ fontSize: '1rem', lineHeight: '1.3rem' }}>
                      <h3>Component info:</h3>
                      The Model explanations control is intended to provide a
                      natural language explanation of the most significant
                      factors identified in relation to the system forecast.
                      <h3>Interaction info:</h3>
                      This control does not interact with any other.
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
              </Title>
              {homepageForecastData.forecastData.explanation ? (
                ReactHtmlParser(
                  homepageForecastData.userForecastData.explanation ||
                    homepageForecastData.forecastData.explanation,
                )
              ) : (
                <React.Fragment>
                  <Typography component="h6" variant="subtitle1">
                    Projected <i>Unemployment (+8%)</i> levels and{' '}
                    <i>conflict (+2%)</i> are likely to lead to increased forced
                    displacement within the forecast period 2019-2022.
                  </Typography>
                  <ul>
                    <li>
                      <Typography component="p" variant="body1">
                        Unemployment data based on World Bank estimates, based
                        on ILO modelled estimates for 2018. Cluster includes
                        adult male unemployment for specific age brackets, adult
                        female unemployment. Projections made through till 2019
                        using am autoregressive model based on data for
                        1995-2018. Coverage varies.
                      </Typography>
                    </li>
                    <li>
                      <Typography component="p" variant="body1">
                        Conflict data from ACLED, measured as number of deaths
                        per annum due to violent conflict.
                      </Typography>
                    </li>
                  </ul>
                </React.Fragment>
              )}
            </Paper>
          </Grid>
          <Grid item lg={12} md={12} xs={12}></Grid>
        </Grid>
      </Container>
    </section>
  );
};

const mapStateToProps = state => ({
  homepageDataTrends: state.homepageDataTrendsStore.dataTrends,
  homepageForecastData: state.homepageForecastStore,
  countryCode: state.filterStore.selectedCategories.Country[0],
  mapData: state.mapStore.mapData,
  scenarioData: state.homepageScenarioDataStore.scenarioData,
  isMapDataLoading: state.mapStore.isLoading,
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
    initMapDataLoad: () => dispatch(initMapDataLoad()),
    initScenarioDataLoad: () => dispatch(initScenarioDataLoad()),
    passSelectedCountry: selectedCategories =>
      dispatch(selectCategories(selectedCategories)),
    passSavedSarImage: imageURL => dispatch(saveSarImage(imageURL)),
    clearUserForecastData: () => dispatch(finishUserForecastDataLoad({})),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);
