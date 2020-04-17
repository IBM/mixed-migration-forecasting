import React from 'react';
import { connect } from 'react-redux';
import { initChartData } from '../../../../redux/dashboardContent/actions';

import Plotly from 'plotly.js-basic-dist';
import createPlotlyComponent from 'react-plotly.js/factory';

import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import SettingsIcon from '@material-ui/icons/Settings';
import FilterListIcon from '@material-ui/icons/FilterList';
import ChangeViewButton from '../../ChangeViewButton/ChangeViewButton';
import ChartDataInTable from '../../ChartDataInTable/ChartDataInTable';
import { chartDataGenerate } from '../chartHandlers';
import { SubTitle } from '../../../common';
import chartsTheme from '../chartsGeneric.theme';

import numeral from 'numeral';

const Plot = createPlotlyComponent(Plotly);

const useStyles = makeStyles(chartsTheme);

const LineChart = props => {
  const ownClasses = useStyles();
  const {
    indicatorNames,
    classes,
    countryCode,
    currrentCountry,
    initIndicator,
    short,
    lineChartData = [],
  } = props;
  const [selectedIndicator, setSelectedIndicator] = React.useState(
    props.initIndicator,
  );
  const [chartStyle, setChartStyle] = React.useState(true);
  const [currentPieData, setCurrentPieData] = React.useState([]);
  const [selectedYears, setSelectedYears] = React.useState([]);
  const [tableData, setTableData] = React.useState('');

  const currentPieDataByIndicator =
    lineChartData && lineChartData[selectedIndicator];
  const getPieData = (indicatorName, countryCode) => {
    props.initChartData({
      countries: countryCode,
      years: '1990-2019',
      indicators: indicatorName,
    });
  };

  React.useEffect(() => {
    getPieData(selectedIndicator, countryCode);
  }, [countryCode, selectedIndicator]);

  const changeChartOrTableView = () => {
    setChartStyle(!chartStyle);
  };

  const handleYearSelectChange = e => {
    setSelectedYears(e.target.value);
    const currentPieData = [];
    if (currentPieDataByIndicator) {
      currentPieDataByIndicator.forEach(elem => {
        if (e.target.value.some(el => el === elem.year)) {
          currentPieData.push(elem);
        }
      });
    }
    setTableData(currentPieData);
    const chartPieData = chartDataGenerate(currentPieData, {
      mode: 'lines',
      x: [],
      y: [],
      name: 'Data',
      marker: {
        color: '#5fc77b',
        size: 8,
      },
    });
    const anomaliesChartData = chartDataGenerate(
      currentPieData
        .filter(el => !!el.outlier)
        .map(el => ({ year: el.year, value: el.outlier })),
      {
        x: [],
        y: [],
        mode: 'markers',
        name: 'Anomalies',
        marker: {
          color: 'red',
          size: 10,
        },
      },
    );
    if (anomaliesChartData) {
      chartPieData.push(anomaliesChartData[0]);
    }
    setCurrentPieData(chartPieData);
  };

  React.useEffect(() => {
    if (currentPieDataByIndicator && currentPieDataByIndicator.length) {
      const currentYears = currentPieDataByIndicator
        .reverse()
        .slice(0, 10)
        .map(el => el.year);
      setSelectedYears(currentYears);
      const currentPieData = currentPieDataByIndicator.slice(0, 10);
      setTableData(currentPieData);
      const chartPieData = chartDataGenerate(currentPieData, {
        mode: 'lines',
        x: [],
        y: [],
        name: 'Data',
        marker: {
          color: '#5fc77b',
          size: 8,
        },
      });
      const anomaliesChartData = chartDataGenerate(
        currentPieData
          .filter(el => !!el.outlier)
          .map(el => ({ year: el.year, value: el.outlier })),
        {
          x: [],
          y: [],
          mode: 'markers',
          name: 'Anomaly',
          marker: {
            color: 'red',
            size: 10,
          },
        },
      );
      if (anomaliesChartData) {
        chartPieData.push(anomaliesChartData[0]);
      }
      setCurrentPieData(chartPieData);
    }
  }, [currentPieDataByIndicator]);

  const handleChange = event => {
    setSelectedIndicator(event.target.value);
  };

  return (
    <React.Fragment>
      <SubTitle>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            {`${selectedIndicator ||
              'Internally displaced persons'} in ${`${props.currrentCountry}` ||
              'Afghanistan'}`}
          </div>
          {props.isConfig && (
            <div
              style={{
                position: 'relative',
                display: 'flex',
                width: '100px',
                justifyContent: 'space-between',
              }}
            >
              <FilterListIcon />
              <Select
                id="demo-mutiple-name"
                classes={{ select: ownClasses.headerControls }}
                labelId="demo-mutiple-name-label"
                multiple
                onChange={handleYearSelectChange}
                style={{
                  position: 'absolute',
                  opacity: 0,
                  left: 0,
                  height: '24px',
                  maxWidth: '24px',
                  paddingRight: 'none',
                  padding: 'none',
                }}
                value={selectedYears}
              >
                {lineChartData[selectedIndicator] &&
                  lineChartData[selectedIndicator].map(element => (
                    <MenuItem key={element.year} value={element.year}>
                      {element.year}
                    </MenuItem>
                  ))}
              </Select>
              <ChangeViewButton
                listView={chartStyle}
                onViewChange={changeChartOrTableView}
              />
              <SettingsIcon />
              <Select
                classes={{ select: ownClasses.headerControls }}
                onChange={handleChange}
                style={{
                  position: 'absolute',
                  opacity: 0,
                  right: 0,
                  maxHeight: '24px',
                  maxWidth: '24px',
                  paddingRight: 'none',
                  padding: 'none',
                }}
                value={selectedIndicator}
              >
                {props.indicatorNames &&
                  props.indicatorNames.map((el, i) => (
                    <MenuItem key={i} value={el}>
                      {el}
                    </MenuItem>
                  ))}
              </Select>
            </div>
          )}
        </div>
      </SubTitle>
      {chartStyle ? (
        <Plot
          config={{
            scrollZoom: true,
            responsive: true,
            displaylogo: false,
          }}
          data={currentPieData}
          layout={{
            showlegend: short ? false : true,
            uirevision: 'true',
            xaxis: {
              linecolor: 'black',
              linewidth: 0.1,
              xaxis: {
                // autorange: true,
              },
              // mirror: true,
              fixedrange: true,
            },
            yaxis: {
              linecolor: 'black',
              linewidth: 0.1,
              tickformat: '.3s',
              fixedrange: true,
            },
            height: short ? 240 : 480,
            margin: {
              t: 0,
              r: 0,
              l: 40,
              b: short ? 30 : 40,
            },
          }}
          style={{ width: '100%', minHeight: '240px' }}
          useResizeHandler
        />
      ) : (
        <ChartDataInTable
          country={currrentCountry}
          indicatorName={selectedIndicator}
          data={tableData}
        />
      )}
    </React.Fragment>
  );
};

const mapStateToProps = state => ({
  lineChartData: state.dashboardContentStore.filterData,
});
const mapDisaptchToProps = dispatch => ({
  initChartData: payload => dispatch(initChartData(payload)),
});
export default connect(mapStateToProps, mapDisaptchToProps)(LineChart);
