import React from 'react';
import Plotly from 'plotly.js-basic-dist';
import numeral from 'numeral';

import createPlotlyComponent from 'react-plotly.js/factory';
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import SettingsIcon from '@material-ui/icons/Settings';
import FilterListIcon from '@material-ui/icons/FilterList';
import { SubTitle } from '../../../common';
import ChangeViewButton from '../../ChangeViewButton/ChangeViewButton';
import ChartDataInTable from '../../ChartDataInTable/ChartDataInTable';
import { initChartData } from '../../../../redux/dashboardContent/actions';
import { chartDataGenerate } from '../chartHandlers';
import chartsTheme from '../chartsGeneric.theme';

const Plot = createPlotlyComponent(Plotly);

const useStyles = makeStyles(chartsTheme);

const BarChart = props => {
  const ownClasses = useStyles();
  const { cleanBarData = [], countryCode, short } = props;

  const [selectedIndicator, setSelectedIndicator] = React.useState(
    props.initIndicator,
  );
  const [chartStyle, setChartStyle] = React.useState(true);
  const [currentBarData, setCurrentBarData] = React.useState([]);
  const [selectedYears, setSelectedYears] = React.useState([]);
  const [tableData, setTableData] = React.useState('');

  const currentBarDataByIndicator =
    cleanBarData && cleanBarData[selectedIndicator];
  const getBarData = (indicatorName, countryCode) => {
    props.initChartData({
      countries: countryCode,
      years: '1990-2019',
      indicators: indicatorName,
    });
  };

  React.useEffect(() => {
    getBarData(selectedIndicator, countryCode);
  }, [countryCode, selectedIndicator]);

  const changeChartOrTableView = () => {
    setChartStyle(!chartStyle);
  };
  const handleChange = event => {
    setSelectedIndicator(event.target.value);
  };

  const handleYearSelectChange = e => {
    setSelectedYears(e.target.value);
    const currentBarData = [];
    if (currentBarDataByIndicator) {
      currentBarDataByIndicator.forEach(elem => {
        if (e.target.value.some(el => el === elem.year)) {
          currentBarData.push(elem);
        }
      });
    }
    setTableData(currentBarData);
    setTableData(currentBarData);
    setCurrentBarData(
      chartDataGenerate(currentBarData, {
        type: 'bar',
        hoverinfo: 'x+y',
        text: currentBarData.map(
          el => numeral(el.value).format('0.0[0]a') || '',
        ),
        textinfo: 'label',
        x: [],
        y: [],
      }),
    );
  };

  React.useEffect(() => {
    if (currentBarDataByIndicator && currentBarDataByIndicator.length) {
      const currentYears = currentBarDataByIndicator
        .reverse()
        .slice(0, 10)
        .map(el => el.year);
      setSelectedYears(currentYears);
      const currentBarData = currentBarDataByIndicator.slice(0, 10);
      setTableData(currentBarData);
      setCurrentBarData(
        chartDataGenerate(currentBarData, {
          type: 'bar',
          hoverinfo: 'x+text',
          text: currentBarData.map(
            el => numeral(el.value).format('0.0[0]a') || '',
          ),
          textinfo: 'label',
          x: [],
          y: [],
        }),
      );
    }
  }, [currentBarDataByIndicator]);
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
                classes={{ select: ownClasses.headerControls }}
                id="demo-mutiple-name"
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
                {cleanBarData[selectedIndicator] &&
                  cleanBarData[selectedIndicator].map(element => (
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
          data={currentBarData}
          layout={{
            showlegend: false,
            height: short ? 240 : 480,
            xaxis: {
              fixedrange: true,
            },
            yaxis: {
              tickformat: '.3s',
              fixedrange: true,
            },
            margin: {
              t: 0,
              r: 0,
              l: 40,
              b: short ? 30 : 40,
            },
          }}
          style={{ width: '100%' }}
          useResizeHandler
        />
      ) : (
        <ChartDataInTable
          country={props.currrentCountry}
          indicatorName={selectedIndicator}
          data={tableData}
        />
      )}
    </React.Fragment>
  );
};

const mapDispatchToProps = dispatch => ({
  initChartData: payload => dispatch(initChartData(payload)),
});

const mapStateToProps = state => ({
  genericCountryData: state.genericCountryDataStore.countryGenData,
  cleanBarData: state.dashboardContentStore.filterData,
});

export default connect(mapStateToProps, mapDispatchToProps)(BarChart);
