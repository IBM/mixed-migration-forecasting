const barChartSkeleton = () => ({
  barSkeletonHeader: {
    margin: '20px 0',
  },
  barSkeletonCategories: {
    height: '20px',
    flexWrap: 'wrap',
    '& span': {
      '& span': {
        margin: '0 3px',
      },
    },
  },
  barSkeletonChart: {
    textAlign: 'center',
    marginTop: '20px',
  },
});

export default barChartSkeleton;
