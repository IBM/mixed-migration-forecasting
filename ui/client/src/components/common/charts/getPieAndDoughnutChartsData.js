import { backGroundColors } from './chartColors';
export const getPieAndDoughnutChartsData = (
  data = [],
  dataParam,
  categories,
) => {
  const circleChartData = {};
  let tempData = {};
  if (data) {
    const prevData = data;
    // .filter(el => el[dataParam] !== '')
    // .reduce((acc, el) => {
    //   acc[el[dataParam]] = (acc[el[dataParam]] || 0) + 1;
    //   return acc;
    // }, {});
    let sortable = [];
    for (let category in prevData) {
      sortable.push([category, prevData[category]]);
    }
    sortable.sort((a, b) => b[1] - a[1]);
    if (!categories) {
      tempData = sortable.slice(0, 10).reduce((acc, el) => {
        acc[el[0]] = el[1];
        return acc;
      }, {});
    } else {
      tempData = sortable.reduce((acc, el) => {
        if (categories.includes(el[0])) {
          acc[el[0]] = el[1];
        }
        return acc;
      }, {});
    }
    Object.keys(tempData).forEach(item => {
      if (!circleChartData.labels) {
        circleChartData.labels = [item];
        circleChartData.datasets = [{ data: [tempData[item]] }];
        circleChartData.allData = [[item, tempData[item]]];
      } else {
        circleChartData.labels.push(item);
        circleChartData.datasets[0].data.push(tempData[item]);
        circleChartData.allData.push([item, tempData[item]]);
      }
    });
    if (Object.keys(circleChartData).length) {
      circleChartData.filterData = sortable;
      circleChartData.datasets[0].backgroundColor = backGroundColors.reverse();
      circleChartData.datasets[0].hoverBackgroundColor = backGroundColors.reverse();
    }
  }
  return circleChartData;
};
