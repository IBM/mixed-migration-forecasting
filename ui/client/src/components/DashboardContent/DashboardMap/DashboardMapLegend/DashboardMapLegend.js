import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import dashboardMapLegend from './DashboardMapLegend.theme';
const useStyles = makeStyles(dashboardMapLegend);
const DashboardLegend = () => {
  const classes = useStyles();
  return (
    <div className={classes.legendContainer}>
      <div className={classes.colorBlock} />
      <span className={classes.title}> - No data for this country</span>
      <div className={classes.colorBlockPurple} />
      <span className={classes.title}> - Selected country</span>
    </div>
  );
};
export default DashboardLegend;
