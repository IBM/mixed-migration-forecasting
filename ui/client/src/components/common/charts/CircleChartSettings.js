//Base imports
import React from 'react';

//Material UI
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import SettingsIcon from '@material-ui/icons/Settings';
import FilterListIcon from '@material-ui/icons/FilterList';
import CloudDownloadOutlinedIcon from '@material-ui/icons/CloudDownloadOutlined';

//Custom components
import ChangeViewButton from '../ChangeViewButton/ChangeViewButton';
import { getPieAndDoughnutChartsData } from './getPieAndDoughnutChartsData';
import circleChartComponentSettings from './CircleChartComponent/CircleChartComponentSettings.theme';

const useStyles = makeStyles(circleChartComponentSettings);

const categoriesList = [
  'Trafficking Sub-Type',
  'Transportation Method',
  'Trafficking Type',
  'Recruitment Method',
];

const CircleChartsSettings = props => {
  const classes = useStyles();
  const {
    chartCategory,
    filterCategoriesHandler,
    setFilteredData,
    dashboardContent,
    filterCategories,
    data,
    changeChartVisible,
    setChartViewHandler,
    setChartCategoryHandler,
  } = props;
  return (
    <Box className={classes.titleContainer}>
      <Box>{chartCategory}</Box>
      <Box className={classes.settingsBlock}>
        <FilterListIcon />
        <Select
          className={classes.filteredType}
          multiple
          onChange={e => {
            filterCategoriesHandler(e.target.value);
            setFilteredData(
              getPieAndDoughnutChartsData(
                dashboardContent.filterData,
                chartCategory,
                e.target.value,
              ),
            );
          }}
          value={filterCategories || []}
        >
          {data &&
            data.filterData &&
            data.filterData.map(filter => (
              <MenuItem key={filter[0]} value={filter[0]}>
                {filter[0]}
              </MenuItem>
            ))}
        </Select>
        <CloudDownloadOutlinedIcon />
        <ChangeViewButton
          listView={changeChartVisible}
          onViewChange={setChartViewHandler}
        />

        <SettingsIcon />
        <Select
          className={classes.selectType}
          onChange={e => {
            setChartCategoryHandler(e.target.value);
            setFilteredData(
              getPieAndDoughnutChartsData(
                dashboardContent.filterData,
                e.target.value,
              ),
            );
          }}
          value={chartCategory}
        >
          {categoriesList.map(option => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </Box>
    </Box>
  );
};
export default CircleChartsSettings;
