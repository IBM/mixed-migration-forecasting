import defaultImage from '../../static/images/scatterAfghanistan.png';

const CardReport = theme => ({
  cardContainer: {
    display: 'flex',
    background: '#fff',
    border: '1px solid lightgrey',
    flexDirection: 'column',
    height: '100%',
    minWidth: '220px',
    minHeight: '220px',
    textDecoration: 'none',
  },
  imgBlock: {
    backgroundImage: `url(${defaultImage})`,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    height: '120px',
  },
  infoBlock: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: '1',
    padding: theme.spacing(2),
    color: '#000',
  },
  conclusion: {
    maxHeight: '240px',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    flexGrow: '1',
  },
  subInfoBlock: {
    marginBottom: '0',
    color: '#0062ff',
  },
});
export default CardReport;
