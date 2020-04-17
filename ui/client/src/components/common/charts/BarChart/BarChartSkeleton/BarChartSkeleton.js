//Base imports
import React, { Fragment } from 'react';
import Skeleton from 'react-loading-skeleton';

//Material UI  components
import { makeStyles } from '@material-ui/core/styles';

//Custom components
import barChartSkeleton from './BarChartSkeleton.theme';

const useStyles = makeStyles(barChartSkeleton);

const BarChartSkeleton = () => {
  const classes = useStyles();
  return (
    <Fragment>
      <div className={classes.barSkeletonHeader}>
        {<Skeleton height="25px" width="35%" />}
      </div>
      <div className={classes.barSkeletonCategories}>
        {
          <Skeleton
            className={classes.barSkeletonCategory}
            count={3}
            height="10px"
            width="31%"
          />
        }
      </div>
      <div className={classes.barSkeletonChart}>
        {<Skeleton rect height={180} width={360} />}
      </div>
    </Fragment>
  );
};
export default BarChartSkeleton;
