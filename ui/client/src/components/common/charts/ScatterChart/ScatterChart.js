import React from 'react';
import { connect } from 'react-redux';
import Plotly from 'plotly.js-basic-dist';
import createPlotlyComponent from 'react-plotly.js/factory';
import { chartDataGenerate } from '../chartHandlers';
import Skeleton from 'react-loading-skeleton';

const Plot = createPlotlyComponent(Plotly);

const ScatterChart = props => {
  const { forecastData, userForecastData } = props;
  let [legendHiddenLayers, setLegendHiddenLayers] = React.useState({});
  let scatterChartData = [];
  const generateForecastData = (data, param) => {
    const generatedData = [];
    if (Object.keys(data).length) {
      Object.keys(data[param]).forEach(el => {
        generatedData.push({
          year: el,
          value: data[param][el],
        });
      });
    }
    return generatedData;
  };

  const generateCIData = data => {
    const predictCIData = [];
    const maxCILineData = [];
    const minCILineData = [];
    if (Object.keys(data).length) {
      Object.keys(data['tdpPredictCI']).forEach(el => {
        maxCILineData.push({
          year: el,
          value: data['tdpPredictCI'][el].max,
        });
      });
      Object.keys(data['tdpPredictCI'])
        .reverse()
        .forEach(el => {
          minCILineData.push({
            year: el,
            value: data['tdpPredictCI'][el].min,
          });
        });
      predictCIData.push(...maxCILineData);
      predictCIData.push(...minCILineData);
      predictCIData.push(maxCILineData[0]);
    }
    return { predictCIData, maxCILineData, minCILineData };
  };

  const { predictCIData, maxCILineData, minCILineData } = generateCIData(
    forecastData,
  );

  scatterChartData.push(
    chartDataGenerate(generateForecastData(forecastData, 'tdpStat'), {
      mode: 'markers',
      x: [],
      y: [],
      name: 'Observation',
      marker: {
        size: 8,
      },
    })[0],
  );

  scatterChartData.push(
    chartDataGenerate(predictCIData, {
      x: [],
      y: [],
      mode: 'lines',
      name: 'Baseline Interval',
      text: [],
      line: {
        color: 'transparent',
      },
      fill: 'toself',
      fillcolor: !legendHiddenLayers['Baseline Interval']
        ? 'rgba(26,150,65,0.3)'
        : 'transparent',
    })[0],
  );

  if (!legendHiddenLayers['Baseline Interval']) {
    scatterChartData.push(
      chartDataGenerate(maxCILineData, {
        x: [],
        y: [],
        mode: 'lines',
        name: 'Max',
        showlegend: false,
        line: {
          color: 'black',
          width: 1,
        },
      })[0],
    );

    scatterChartData.push(
      chartDataGenerate(minCILineData, {
        x: [],
        y: [],
        mode: 'lines',
        name: 'Min',
        showlegend: false,
        line: {
          color: 'black',
          width: 1,
        },
      })[0],
    );
  }

  scatterChartData.push(
    chartDataGenerate(generateForecastData(forecastData, 'tdpPredict'), {
      mode: 'markers',
      x: [],
      y: [],
      name: 'Baseline Forecast',
      marker: {
        size: 10,
        color: 'red',
        symbol: 'square',
      },
    })[0],
  );

  if (userForecastData.tdpPredict) {
    const {
      predictCIData: predictScenarioCIData,
      maxCILineData: maxScenarioCILineData,
      minCILineData: minScenarioCILineData,
    } = generateCIData(userForecastData);

    scatterChartData.push(
      chartDataGenerate(predictScenarioCIData, {
        x: [],
        y: [],
        mode: 'lines',
        name: 'Scenario Interval',
        text: [],
        line: {
          color: 'transparent',
        },
        fill: 'toself',
        fillcolor: !legendHiddenLayers['Scenario Interval']
          ? 'rgba(186, 60, 200,0.3)'
          : 'transparent',
      })[0],
    );

    if (!legendHiddenLayers['Scenario Interval']) {
      scatterChartData.push(
        chartDataGenerate(maxScenarioCILineData, {
          x: [],
          y: [],
          mode: 'lines',
          name: 'Max',
          showlegend: false,
          line: {
            color: 'black',
            width: 1,
          },
        })[0],
      );

      scatterChartData.push(
        chartDataGenerate(minScenarioCILineData, {
          x: [],
          y: [],
          mode: 'lines',
          name: 'Min',
          showlegend: false,
          line: {
            color: 'black',
            width: 1,
          },
        })[0],
      );
    }

    scatterChartData.push(
      chartDataGenerate(generateForecastData(userForecastData, 'tdpPredict'), {
        x: [],
        y: [],
        mode: 'markers',
        type: 'lines',
        name: 'Scenario Forecast',
        marker: {
          size: 8,
          color: '#ffff00',
          symbol: 'triangle-up',
        },
      })[0],
    );
  }

  // scatterChartData =
  //   forecastData.country === 'AFG' || forecastData.country === 'MMR'
  //     ? scatterChartData
  //     : [
  //         {
  //           x: [],
  //           y: [],
  //           mode: 'markers',
  //           type: 'scatter',
  //           name: 'Observation',
  //           text: [],
  //           marker: {
  //             size: 8,
  //           },
  //         },
  //       ];
  return (
    <React.Fragment>
      {forecastData.country ? (
        <Plot
          config={{
            scrollZoom: true,
            responsive: true,
            displaylogo: false,
          }}
          data={scatterChartData || []}
          layout={{
            uirevision: 'true',
            xaxis: {
              linecolor: 'black',
              linewidth: 0.1,
              xaxis: {
                autorange: true,
              },
              fixedrange: true,
              // mirror: true,
            },
            plot_bgcolor: '#ddd',
            paper_bgcolor: '#ddd',
            yaxis: {
              linecolor: 'black',
              linewidth: 0.1,
              tickformat: '.3s',
              fixedrange: true,
            },
            height: 400,
            title: 'Total Displaced Persons',
          }}
          onLegendClick={e => {
            const tempToggledValues = { ...legendHiddenLayers };
            const elName = e.data[e.expandedIndex].name;
            tempToggledValues[elName] = 1 - (tempToggledValues[elName] | 0);
            setLegendHiddenLayers(tempToggledValues);
          }}
        />
      ) : (
        <Skeleton height="400px" width="100%" />
      )}
    </React.Fragment>
  );
};

const mapStateToProps = state => {
  return {
    forecastData: state.homepageForecastStore.forecastData,
    userForecastData: state.homepageForecastStore.userForecastData,
    countryCode: state.filterStore.selectedCategories.Country[0],
  };
};

export default connect(mapStateToProps, null)(ScatterChart);
