//Base imports
import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';

//Redux
import { initMapDataLoad } from '../../redux/mapContent/actions';
import { initIndicatorsLoad } from '../../redux/allIndicators/actions';
import { initDataTrendsMetaLoad } from '../../redux/homepageDataTrends/actions';
import { GET_INDICATOR_CODE_BY_NAME } from '../../redux/constRequestURLs';

//Custom components
import PlotBubbleMap from '../../components/Maps/PlotBubbleMap/PlotBubbleMap';
import SkeletonBubbleMap from '../../components/Maps/PlotBubbleMap/SkeletonBubbleMap';

//Material UI components
import Grid from '@material-ui/core/Grid';
import Slider from '@material-ui/core/Slider';
import { Title } from '../../components/common';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import InfoIcon from '@material-ui/icons/Info';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import Container from '@material-ui/core/Container';
import ListSubheader from '@material-ui/core/ListSubheader';

// Styles
import mapContainerTheme from './MapContainer.theme';

const keyIndicators = [
  'GDP per capita, PPP (current international $)',
  'Number of conflict events per year',
  'Fatalities from conflict events per year',
  'Internally displaced persons',
  'UNHCR total externally displaced persons',
  'Total forced displacement',
  'Urban population growth (annual %)',
  'EMDAT estimate of Total.deaths for Natural disaster group',
  'EMDAT estimate of Total.affected for Natural disaster group',
  'Unemployment, total (% of total labor force) (modeled ILO estimate)',
  'Returned Refugees',
  'Civilian fatalities from conflict events per year',
  'Access to electricity (% of population)',
  'Human Rights Score Mean',
];

const useStyles = makeStyles(mapContainerTheme);

function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

const MapContainer = props => {
  const classes = useStyles();
  const [currentYear, setCurrentYear] = useState('2002');
  const [currentIndicator, setCurrentIndicator] = useState(
    'Total forced displacement',
  );
  const [currentIndicatorCode, setCurrentIndicatorCode] = useState(
    'DRC.TOT.DISP',
  );
  const [indicatorNames, setIndicatorNames] = React.useState([]);
  const { isLoading } = props.mapData;
  let years = [];
  let dataForMap = [];

  React.useEffect(() => {
    const tempFunc = async () => {
      const indicatorCode = await axios({
        method: 'get',
        url: GET_INDICATOR_CODE_BY_NAME,
        headers: {},
        params: {
          indicator: currentIndicator || 'Total forced displacement',
        },
      });
      setCurrentIndicatorCode(indicatorCode.data);
    };
    tempFunc();
  }, [currentIndicator]);

  React.useEffect(() => {
    setIndicatorNames(props.indicators);
  }, [props.indicators]);

  useEffect(() => {
    props.initIndicatorsLoad();
    props.initDataTrendsMetaLoad();
    mapByIndicatorsRequest();
  }, []);

  const mapByIndicatorsRequest = (indicator, years) => {
    props.initMapDataLoad({
      indicator,
      years,
    });
  };

  const [delay, setDelay] = useState(1000);
  const [isRunning, setIsRunning] = useState(true);

  useInterval(
    () => {
      const targetIndex =
        years.indexOf(currentYear) < years.length - 1
          ? years.indexOf(currentYear) + 1
          : 0;
      setCurrentYear(years[targetIndex]);
    },
    isRunning ? delay : null,
  );

  useEffect(() => {
    if (Object.keys(props.mapData.mapData).length) {
      setCurrentYear(Object.keys(props.mapData.mapData.victimsList)[0]);
    }
  }, [props.mapData.mapData]);

  if (!isLoading && props.mapData.mapData) {
    years = Object.keys(props.mapData.mapData.victimsList);
    dataForMap = props.mapData.mapData.victimsList;
  }
  const indicatorDetails = props.metaData.filter(
    el => el['Indicator Code'] === currentIndicatorCode,
  )[0];
  const longText = (
    <div style={{ fontSize: '1rem', lineHeight: '1.3rem' }}>
      <h3>Page info</h3>
      The Timeline Indicator uses a map-based visualization to display the
      selected indicator values by year and country for the data periods
      available in the system. The page includes an option to playback the data
      over time, stop & select specific years, zoom in & out in the map, hover
      over a country ‘bubble’ for additional information and the ability to
      select a different indicator to analysein the map.
      <h3>Indicator info</h3>
      {indicatorDetails ? (
        <React.Fragment>
          <p>{indicatorDetails.detail}</p>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              Source:
              <br /> {indicatorDetails.source}
            </div>
            <div>
              Data Last Updated: <br /> {indicatorDetails['last updated']}
            </div>
          </div>
        </React.Fragment>
      ) : null}
    </div>
  );
  return (
    <Container className={classes.container} maxWidth="xl">
      <Title>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <span>{currentIndicator}</span>
            <Tooltip title={longText} arrow>
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
          <Select
            className={classes.selectType}
            onChange={e => {
              setCurrentIndicator(e.target.value);
              mapByIndicatorsRequest(e.target.value, '2000-2019');
            }}
            value={currentIndicator}
          >
            <ListSubheader style={{ backgroundColor: '#fff' }}>
              Key Indicators
            </ListSubheader>
            {keyIndicators.map(option => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
            <ListSubheader style={{ backgroundColor: '#fff' }}>
              All Indicators
            </ListSubheader>
            {indicatorNames.map((option, i) => {
              if (!keyIndicators.includes(option)) {
                return (
                  <MenuItem key={`${option}+${i}`} value={option}>
                    {option}
                  </MenuItem>
                );
              }
            })}
          </Select>
        </div>
      </Title>
      {!isLoading ? (
        <div>
          <Title style={{ color: '#000' }}>Year: {currentYear}</Title>
          <Box style={{ display: 'flex' }}>
            <Button
              style={{
                color: 'unset',
                padding: '0',
                minWidth: 'unset',
                marginRight: '10px',
              }}
              onClick={() => setIsRunning(!isRunning)}
            >
              {isRunning ? (
                <PauseIcon color="secondary" />
              ) : (
                <PlayArrowIcon color="secondary" />
              )}
            </Button>
            <Slider
              color="secondary"
              aria-labelledby="discrete-slider-small-steps"
              value={+currentYear || Math.min(...years)}
              marks
              max={Math.max(...years)}
              min={Math.min(...years)}
              onChange={(event, value) => {
                setCurrentYear(value.toString());
              }}
              step={1}
              valueLabelDisplay="auto"
            />
          </Box>
          <Box className={classes.plotly}>
            <PlotBubbleMap
              currentYear={currentYear}
              data={dataForMap[currentYear] || []}
              isLoading={isLoading}
              maxRadius={5}
            />
          </Box>
        </div>
      ) : (
        <SkeletonBubbleMap />
      )}
    </Container>
  );
};
const mapStateToProps = state => {
  return {
    mapData: state.mapStore,
    indicators: state.indicatorsStore.indicators,
    metaData: state.homepageDataTrendsStore.metaData || [],
  };
};
const mapDispatchToProps = dispatch => {
  return {
    initMapDataLoad: requestBody => dispatch(initMapDataLoad(requestBody)),
    initIndicatorsLoad: () => dispatch(initIndicatorsLoad()),
    initDataTrendsMetaLoad: requestParams =>
      dispatch(initDataTrendsMetaLoad(requestParams)),
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(MapContainer);
