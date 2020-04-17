import backgroundImage from '../../static/images/scatterAfghanistan.png';

const analysisRegister = () => ({
  mainPageContainer: {
    display: 'flex',
    height: '78px',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pageTitle: {
    height: '78px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    lineHeight: '28px',
    fontSize: '30px',
  },
  toolbarTitle: {
    display: 'flex',
    alignItems: 'center',
    height: '78px',
  },
  createReportBtn: {
    textTransform: 'uppercase',
    color: 'white',
    fontSize: '14px',
    textDecoration: 'none',
  },
  paper: {
    display: 'flex',
    alignItems: 'center',
    padding: '25px',
    height: '250px',
    backgroundImage: `url(${backgroundImage})`,
    backgroundRepeat: 'no-repeat',
    backgroundColor: 'rgba(255, 255, 255, .8)',
  },
  headlineLink: {
    textDecoration: 'none',
    color: '#0062ff',
    '&>p': {
      marginTop: '.5rem',
      marginBottom: '0',
    },
  },
});
export default analysisRegister;
