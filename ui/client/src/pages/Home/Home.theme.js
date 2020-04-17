const homeTheme = theme => ({
  root: {
    minHeight: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f3f3f3',
    margin: '0 auto',
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
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  fixedHeight: {
    height: 240,
  },
  innerCharts: {
    padding: '.75rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
  },
});

export default homeTheme;
