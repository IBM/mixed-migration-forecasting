const pageHeader = theme => ({
  link: {
    textTransform: 'uppercase',
    color: '#e7e5e7',
    textDecoration: 'none',
    fontWeight: 300,
  },
  linkMargin: {
    margin: theme.spacing(1, 1.5),
  },
  appBar: {
    backgroundColor: '#3c3d41',
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarSpacer: theme.mixins.toolbar,
  title: {
    maxHeight: '4rem',
    flexGrow: 1,
  },
  logo: {
    maxHeight: '3rem',
  },
  selectAndIconContainer: {
    position: 'relative',
    marginLeft: theme.spacing(1.5),
  },
  iconProfile: {
    width: '2rem',
    height: '2rem',
  },
  profileSelect: {
    position: 'absolute',
    right: 0,
    height: '2rem',
    width: '2rem',
    opacity: 0,
  },
  wrapper: {
    position: 'relative',
  },
  paper: {
    position: 'absolute',
    top: 57,
    width: '280px',
    right: 0,
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
  },
  profile: {
    borderRadius: '50%',
    background: 'lightblue',
    color: '#fff',
    width: '40px',
    minWidth: '40px',
    height: '40px',
    border: 'none',
    fontSize: '21px',
    padding: 0,
  },
  tooltipHeader: {
    display: 'flex',
    alignItems: 'center',
    paddingBottom: '12px',
    borderBottom: '.5px solid lightgrey',
  },
  avatar: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '50%',
    background: 'lightblue',
    color: '#fff',
    minWidth: '40px',
    minHeight: '40px',
    border: 'none',
    fontSize: '19px',
  },
  headerInfo: {
    marginLeft: '12px',
    overflow: 'hidden',
  },
  fullName: {
    fontFamily: 'Roboto',
    fontSize: '15px',
    fontWeight: '600',
  },
  email: {
    fontSize: '13px',
  },
  headerLinks: {
    marginTop: '12px',
    '& a': {
      color: '#000',
      textDecoration: 'none',
    },
  },
  linkInProfile: {
    padding: 0,
  },
});
export default pageHeader;
