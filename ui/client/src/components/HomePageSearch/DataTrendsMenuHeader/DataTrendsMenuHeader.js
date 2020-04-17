import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import dataTrendsMenuHeader from './DataTrendsMenuHeader.theme';
const useStyles = makeStyles(dataTrendsMenuHeader);

const DataTrendsMenuHeader = props => {
  const classes = useStyles();
  const { dense } = props;
  return (
    <div className={classes.headExpandedMenu}>
      <div className={classes.expandName}>Name</div>
      <div className={classes.expandSource}>Source</div>
      <div className={classes.expandValue}>Value</div>
      {dense ? null : <div className={classes.expandTrend}>Trend</div>}
    </div>
  );
};
export default DataTrendsMenuHeader;
