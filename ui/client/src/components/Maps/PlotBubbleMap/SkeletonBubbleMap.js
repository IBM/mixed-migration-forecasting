import React from 'react';
import Skeleton from 'react-loading-skeleton';

const SkeletonBubbleMap = () => {
  return (
    <React.Fragment>
      <Skeleton height="5vh" width="100%" />
      <Skeleton height="70vh" width="100%" />
    </React.Fragment>
  );
};
export default SkeletonBubbleMap;
