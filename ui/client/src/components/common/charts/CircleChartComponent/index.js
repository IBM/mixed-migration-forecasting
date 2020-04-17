//Base imports
import React, { Fragment, useState, useEffect } from 'react';

//Custom components
import CircleChartSkeleton from './CircleChartSkeleton/CircleChartSkeleton';
import { getPieAndDoughnutChartsData } from '../getPieAndDoughnutChartsData';
import ChartDataInTable from '../../ChartDataInTable/ChartDataInTable';
import CircleChartSettings from '../CircleChartSettings';
import Title from '../../typography/Title/Title';
import NoData from '../../typography/NoData';

const CircleChartComponent = props => {
  let data = null;
  const {
    dashboardContent,
    category = 'Trafficking Sub-Type',
    component,
    isCustomize,
    options,
  } = props;
  const defaultOptions = {
    tooltips: {
      callbacks: {
        label: function(tooltipItem, data) {
          //get the concerned dataset
          var dataset = data.datasets[tooltipItem.datasetIndex];
          //calculate the total of this data set
          var total = dataset.data.reduce(function(
            previousValue,
            currentValue,
          ) {
            return previousValue + currentValue;
          });
          //get the current items value
          var currentValue = dataset.data[tooltipItem.index];
          //calculate the precentage based on the total and current item, also this does a rough rounding to give a whole number
          var percentage = Math.floor((currentValue / total) * 100 + 0.5);

          return `${
            data.labels[tooltipItem.index]
          }: ${currentValue} (${percentage}%)`;
        },
      },
    },
  };
  data = getPieAndDoughnutChartsData(dashboardContent.filterData, category);
  const CircleChart = component;
  let circleChartContent = null;
  let titleContent = null;
  const [chartCategory, setChartCategory] = useState(category);
  const [changeChartVisible, setChangeChartVisible] = useState(true);
  const [filterCategories, setFilterCategories] = useState([]);
  const [filteredData, setFilteredData] = useState({});

  const setChartViewHandler = () => {
    setChangeChartVisible(!changeChartVisible);
  };

  const setChartCategoryHandler = value => {
    setChartCategory(value);
  };

  const filterCategoriesHandler = value => {
    setFilterCategories(value);
  };

  data = getPieAndDoughnutChartsData(dashboardContent, chartCategory);
  useEffect(() => {
    if (dashboardContent) {
      filterCategoriesHandler(data.labels);
      setFilteredData(
        getPieAndDoughnutChartsData(dashboardContent.filterData, chartCategory),
      );
    }
  }, [dashboardContent, chartCategory]);
  if (isCustomize && data) {
    titleContent = (
      <CircleChartSettings
        changeChartVisible={changeChartVisible}
        chartCategory={chartCategory}
        dashboardContent={dashboardContent}
        data={data}
        filterCategories={filterCategories}
        filterCategoriesHandler={filterCategoriesHandler}
        setChartCategoryHandler={setChartCategoryHandler}
        setChartViewHandler={setChartViewHandler}
        setFilteredData={setFilteredData}
      />
    );
  } else {
    titleContent = category;
  }

  if (dashboardContent.isLoading) {
    circleChartContent = <CircleChartSkeleton />;
  } else if (Object.entries(data).length === 0 && data.constructor === Object) {
    circleChartContent = <NoData>No Data Available for Selections Made</NoData>;
  } else {
    circleChartContent = !isCustomize ? (
      <CircleChart
        data={data}
        height={null}
        options={{ ...options, ...defaultOptions }}
        width={null}
      />
    ) : changeChartVisible ? (
      <CircleChart
        data={filteredData || data}
        height={null}
        options={{ ...options, ...defaultOptions }}
        width={null}
      />
    ) : (
      <ChartDataInTable category={chartCategory} data={filteredData || data} />
    );
  }
  return (
    <Fragment>
      <Title>{titleContent}</Title>
      {circleChartContent}
    </Fragment>
  );
};

export default CircleChartComponent;
