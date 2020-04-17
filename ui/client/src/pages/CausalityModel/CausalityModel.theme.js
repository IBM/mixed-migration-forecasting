const causalityModelTheme = theme => ({
  root: {
    display: 'flex',
    backgroundColor: '#f3f3f3',
    padding: '0',
  },
  toolbar: {
    backgroundColor: theme.palette.background.paper,
    border: 0,
    borderRadius: 3,
    boxShadow: '0 4px 5px 0px rgba(0, 0, 0, .1)',
  },
  link: {
    margin: theme.spacing(1, 1.5),
  },
  filterApplyBtnContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  filterApplyBtn: {
    alignSelf: 'center',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  title: {
    flexGrow: 1,
  },
  appBarSpacer: theme.mixins.toolbar,
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    // overflow: 'auto',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  fixedHeight: {
    height: 240,
  },
  innerCharts: {
    padding: '.75rem',
  },
  titleContainer: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  settingsBlock: {
    display: 'flex',
    justifyContent: 'space-between',
    position: 'relative',
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

export default causalityModelTheme;
