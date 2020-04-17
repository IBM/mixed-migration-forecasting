import React from 'react';
import Plotly from 'plotly.js-basic-dist';
import createPlotlyComponent from 'react-plotly.js/factory';
import { Title } from '../../../common';
const DonutChart = props => {
  const getDonutChartData = (data, indicatorsList, labelsList) => {
    const arraySum = array => array.reduce((res, el) => res + el, 0);
    let donutChartData = {
      values: [],
      labels: [],
    };
    if (data) {
      indicatorsList.forEach(indicator => {
        if (indicator in data) {
          donutChartData.values.push(+Number(data[indicator]).toFixed(2));
        }
      });

      labelsList.forEach(label => {
        donutChartData.labels.push(label);
      });

      donutChartData.values.push(
        +Number(100 - arraySum(donutChartData.values)).toFixed(2),
      );
    }
    return donutChartData;
  };
  const Plot = createPlotlyComponent(Plotly);
  return (
    <React.Fragment>
      <Title>
        {props.title} {props.countryName ? 'in' : ''} {props.countryName}
      </Title>
      <Plot
        config={{
          responsive: true,
          displaylogo: false,
        }}
        data={[
          {
            values: getDonutChartData(
              props.data,
              props.indicatorsList,
              props.labelsList,
            ).values,
            labels: getDonutChartData(
              props.data,
              props.indicatorsList,
              props.labelsList,
            ).labels,
            hoverinfo: 'label+percent',
            hole: 0.6,
            type: 'pie',
          },
        ]}
        layout={{
          height: 200,
          margin: {
            t: 20,
            r: 0,
            l: 0,
            b: 0,
          },
          showlegend: false,
        }}
        style={{ width: '100%' }}
        useResizeHandler
      />
    </React.Fragment>
  );
};
export default DonutChart;
