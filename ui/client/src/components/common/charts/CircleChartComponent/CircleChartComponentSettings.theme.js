const circleChartComponent = () => ({
  titleContainer: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  settingsBlock: {
    display: 'flex',
    justifyContent: 'space-between',
    position: 'relative',
    width: '125px',
  },
  selectType: {
    position: 'absolute',
    right: 0,
    width: '24px',
    height: '24px',
    opacity: 0,
  },
  filteredType: {
    position: 'absolute',
    left: 0,
    width: '24px',
    height: '24px',
    opacity: 0,
  },
});
export default circleChartComponent;
