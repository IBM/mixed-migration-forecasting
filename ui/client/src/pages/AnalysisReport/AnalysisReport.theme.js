import backgroundImage from '../../static/images/shipwreck.jpg';

const analysisReport = theme => ({
  root: {
    minHeight: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f3f3f3',
  },
  pageTitle: {
    height: '78px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    lineHeight: '28px',
    fontSize: '30px',
  },
  paper: {
    marginTop: '25px',
    // height: '150px',
    // backgroundImage: `url(${backgroundImage})`,
    // backgroundRepeat: 'no-repeat',
    // backgroundSize: 'cover',
    // backgroundColor: 'rgba(0, 0, 0, .8)',
    padding: '25px',
  },
  btnBlock: {
    display: 'flex',
    justifyContent: 'center',
  },
  actionBtn: {
    margin: theme.spacing(1),
  },
});
export default analysisReport;
