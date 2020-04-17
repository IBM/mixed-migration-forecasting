const circleChartSkeleton = () => ({
  circleSkeletonHeader: {
    margin: '20px 0',
  },
  circleSkeletonCategories: {
    height: '20px',
    flexWrap: 'wrap',
    '& span': {
      '& span': {
        margin: '0 3px',
      },
    },
  },
  circleSkeletonChart: {
    textAlign: 'center',
    marginTop: '20px',
  },
});

export default circleChartSkeleton;
