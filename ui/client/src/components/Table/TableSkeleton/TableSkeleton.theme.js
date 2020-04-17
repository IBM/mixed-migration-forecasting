const tableSkeleton = () => ({
  tableSkeletonHeader: {
    margin: '50px 0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tableSkeletonHeaderTitle: {
    width: '25%',
  },
  tableSkeletonSubTitles: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    margin: '20px 0',
    '& span': {
      display: 'flex',
      justifyContent: 'space-between',
      height: '20px',
      width: '100%',
      '& span': {
        height: '20px',
      },
    },
  },
  tableSkeletonContent: {
    marginBottom: '4px',
  },
});

export default tableSkeleton;
