import React from 'react';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpandedDetails from '../ExpandedDetails/ExpandedDetails';
import expansionPanelBlock from './ExpansionPanelBlock.theme';
import { chartDataGenerate } from '../../../common/charts/chartHandlers';
import { makeStyles } from '@material-ui/core/styles';
import { Line } from 'react-chartjs-2';
import numeral from 'numeral';

const useStyles = makeStyles(expansionPanelBlock);

const chartDataGenerator = (coordsSet, yearRange = []) => {
  let x = [];
  let tempArray = [];
  const yearsNumber = yearRange[yearRange.length - 1] - yearRange[0] + 1;
  x = Array.from(new Array(yearsNumber), (val, index) =>
    (yearRange[0] + index).toString(),
  );
  for (let year of x) {
    tempArray.push({
      year: year,
      value: coordsSet[year] || null,
    });
  }
  return tempArray;
};

const getLatestIndValue = dataByYear => {
  const year = Math.max(...Object.keys(dataByYear));
  return dataByYear[year] || 'N/A';
};

const ExpansionPanelBlock = props => {
  const { indicatorData, yearRange, dense, textColor, backgroundColor } = props;
  const classes = useStyles();
  const dataForScatterChart = chartDataGenerator(indicatorData.data, yearRange);
  const chartData = chartDataGenerate(dataForScatterChart, {
    x: [],
    y: [],
    mode: 'lines + scatter',
    text: dataForScatterChart.map(el => `${el.year}`),
    marker: {
      color: '#f2675e',
      size: 8,
    },
  });
  const data = {
    labels: chartData[0].text,
    datasets: [
      {
        label: 'value',
        fill: false,
        showLine: true,
        borderColor: '#f2675e',
        backgroundColor: '#f2675e',
        pointBorderColor: '#f2675e',
        pointBackgroundColor: '#f2675e',
        pointBorderWidth: 6,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#f2675e',
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: chartData[0].y,
      },
    ],
  };
  const options = {
    maintainAspectRatio: false,
    legend: {
      display: false,
    },
    scales: {
      yAxes: [
        {
          display: false,
        },
      ],
      xAxes: [
        {
          display: false,
        },
      ],
    },
    layout: {
      padding: {
        left: 5,
        right: 5,
        top: 10,
        bottom: 10,
      },
    },
    tooltips: {
      callbacks: {
        title: function() {
          return null;
        },
        label: function(tooltipItem, data) {
          return `${data['labels'][tooltipItem['index']]}: ${numeral(
            data['datasets'][0]['data'][tooltipItem['index']],
          ).format('0.0[0]a')}`;
        },
      },
      position: 'nearest',
      yAlign: 'center',
      displayColors: false,
      backgroundColor: '#fff',
      bodyFontColor: '#000',
    },
  };
  return (
    <ExpansionPanel>
      <ExpansionPanelSummary
        aria-controls="panel1a-content"
        id="panel1a-header"
        style={{ backgroundColor: backgroundColor || '#666' }}
      >
        <div className={classes.heading} style={{ color: textColor || '#fff' }}>
          <div className={dense ? '' : classes.headName}>
            {indicatorData.indicatorName}
          </div>
          <div className={dense ? '' : classes.headSource}>
            {indicatorData.source}
          </div>
          <div className={dense ? '' : classes.headValue}>
            {numeral(getLatestIndValue(indicatorData.data)).format('0.0[0]a')}
          </div>
          <div className={classes.chartBlock}>
            <Line data={data} options={options} />
          </div>
        </div>
      </ExpansionPanelSummary>
      <ExpandedDetails
        backgroundColor={backgroundColor}
        indicatorData={indicatorData}
        textColor={textColor}
      />
    </ExpansionPanel>
  );
};
export default ExpansionPanelBlock;
