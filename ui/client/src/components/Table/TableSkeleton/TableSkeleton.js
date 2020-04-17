import React, { Fragment } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Skeleton from 'react-loading-skeleton';

import tableSkeleton from './TableSkeleton.theme';

const useStyles = makeStyles(tableSkeleton);
const TableSkeleton = () => {
  const classes = useStyles();
  return (
    <Fragment>
      <div className={classes.tableSkeletonHeader}>
        <div className={classes.tableSkeletonHeaderTitle}>
          {<Skeleton height="30px" />}
        </div>
        {/* <div>{<Skeleton circle height="35px" width="35px" />}</div> */}
      </div>
      <div className={classes.tableSkeletonSubTitles}>
        {<Skeleton count={5} width="19%" />}
      </div>
      {Array.from(Array(6)).map((element, index) => (
        <div
          className={classes.tableSkeletonContent}
          key={`tableSkeleton_${index}`}
        >
          {<Skeleton height="45px" />}
        </div>
      ))}
    </Fragment>
  );
};
export default TableSkeleton;
