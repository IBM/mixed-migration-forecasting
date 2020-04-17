import React from 'react';
import Plotly from 'plotly.js-basic-dist';
import numeral from 'numeral';

import createPlotlyComponent from 'react-plotly.js/factory';
import { connect } from 'react-redux';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import SettingsIcon from '@material-ui/icons/Settings';
import FilterListIcon from '@material-ui/icons/FilterList';
import { Title } from '../../../common';
import ChangeViewButton from '../../ChangeViewButton/ChangeViewButton';
import ChartDataInTable from '../../ChartDataInTable/ChartDataInTable';
import { initChartData } from '../../../../redux/dashboardContent/actions';
import { chartDataGenerate } from '../chartHandlers';

const Plot = createPlotlyComponent(Plotly);

const PieChart = props => {
  const { cleanPieData = [], countryCode } = props;

  const [selectedIndicator, setSelectedIndicator] = React.useState(
    props.initIndicator,
  );
  const [chartStyle, setChartStyle] = React.useState(true);
  const [currentPieData, setCurrentPieData] = React.useState([]);
  const [selectedYears, setSelectedYears] = React.useState([]);
  const [tableData, setTableData] = React.useState('');

  const currentPieDataByIndicator =
    cleanPieData && cleanPieData[selectedIndicator];
  const getPieData = (indicatorName, countryCode) => {
    props.initChartData({
      countries: countryCode,
      years: '1990-2019',
      indicator: indicatorName,
    });
  };

  React.useEffect(() => {
    getPieData(selectedIndicator, countryCode);
  }, [countryCode, selectedIndicator]);

  const changeChartOrTableView = () => {
    setChartStyle(!chartStyle);
  };
  const handleChange = event => {
    setSelectedIndicator(event.target.value);
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
    setTableData(currentPieData);
    setCurrentPieData(
      chartDataGenerate(currentPieData, {
        type: 'pie',
        hoverinfo: 'label+text',
        text: currentPieData.map(
          el => numeral(el.value).format('0.0[0]a') || '',
        ),
        textinfo: 'label',
        values: [],
        labels: [],
      }),
    );
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
      setCurrentPieData(
        chartDataGenerate(currentPieData, {
          type: 'pie',
          hoverinfo: 'label+text',
          text: currentPieData.map(
            el => numeral(el.value).format('0.0[0]a') || '',
          ),
          textinfo: 'label',
          values: [],
          labels: [],
        }),
      );
    }
  }, [currentPieDataByIndicator]);
  return (
    <React.Fragment>
      <Title>
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
                {cleanPieData[selectedIndicator] &&
                  cleanPieData[selectedIndicator].map(element => (
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
      </Title>
      {chartStyle ? (
        <Plot
          config={{
            scrollZoom: true,
            responsive: true,
          }}
          data={currentPieData}
          layout={{
            showlegend: false,
            height: 450,
            margin: {
              t: 20,
              r: 0,
              l: 0,
              b: 0,
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
  cleanPieData: state.dashboardContentStore.filterData,
});

export default connect(mapStateToProps, mapDispatchToProps)(PieChart);
