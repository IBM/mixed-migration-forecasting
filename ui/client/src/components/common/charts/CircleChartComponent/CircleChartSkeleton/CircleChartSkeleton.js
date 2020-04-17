//Base imports
import React, { Fragment } from 'react';
import Skeleton from 'react-loading-skeleton';

//Material UI components
import { makeStyles } from '@material-ui/core/styles';

//Custom components
import circleChartSkeleton from './CircleChartSkeleton.theme';

const useStyles = makeStyles(circleChartSkeleton);

const CircleChartSkeleton = () => {
  const classes = useStyles();
  return (
    <Fragment>
      <div className={classes.circleSkeletonHeader}>
        {<Skeleton height="25px" width="35%" />}
      </div>
      {Array.from(Array(2)).map((element, index) => (
        <div
          className={classes.circleSkeletonCategories}
          key={`skeleton__${index}`}
        >
          {<Skeleton count={3} height="10px" width="31%" />}
        </div>
      ))}
      <div className={classes.circleSkeletonChart}>
        {<Skeleton circle height={160} width={180} />}
      </div>
    </Fragment>
  );
};
export default CircleChartSkeleton;
