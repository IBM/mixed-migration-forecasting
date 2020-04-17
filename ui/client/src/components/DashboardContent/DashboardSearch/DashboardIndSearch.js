import React from 'react';
import { connect } from 'react-redux';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import SubTitle from '../../common/typography/SubTitle/SubTitle';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import dashboardSearchTheme from './DashboardIndSearch.theme';
import { initDataTrendsMetaLoad } from '../../../redux/homepageDataTrends/actions';
import numeral from 'numeral';

const useStyles = makeStyles(dashboardSearchTheme);

const getLatestIndValue = dataByYear => {
  const year = Math.max(...Object.keys(dataByYear));
  return dataByYear[year] || 'N/A';
};

const DashboardIndSearch = props => {
  const { dataTrends, metaData, dense, onItemClick } = props;
  React.useEffect(() => {
    props.initDataTrendsMetaLoad();
  }, []);
  let data = [];
  for (let item in dataTrends) {
    const metadata = metaData.filter(
      el => el['Indicator Code'] === dataTrends[item]['Indicator Code'],
    );
    data.push({
      indicatorName: item,
      data: dataTrends[item].data,
      ...metadata[0],
    });
  }
  const [currentData, setCurrentData] = React.useState([]);
  React.useEffect(() => {
    if (data.length > 0) {
      setCurrentData(data);
    }
  }, [props.dataTrends]);

  const filterDataTrends = e => {
    const tempData = data.filter(
      item =>
        item.indicatorName
          .toLowerCase()
          .search(e.target.value.toLowerCase()) !== -1 ||
        item.source.toLowerCase().search(e.target.value.toLowerCase()) !== -1,
    );
    setCurrentData(tempData);
  };
  const classes = useStyles();
  // console.log(currentData[0]['last updated'])
  return (
    <Paper className={classes.paper}>
      <div className={classes.root}>
        <SubTitle>Indicators for {props.countryName}</SubTitle>
        <TextField
          className={classes.searchInput}
          label="Search"
          margin="dense"
          onChange={filterDataTrends}
          variant="outlined"
        />
        <Grid container style={{ padding: '0 2rem 0 1rem' }}>
          <Grid item xs={6}>
            Indicator
          </Grid>
          <Grid item xs={3} style={{ alignSelf: 'center', textAlign: 'right' }}>
            Last updated
          </Grid>
          <Grid item xs={3} style={{ alignSelf: 'center', textAlign: 'right' }}>
            Value
          </Grid>
        </Grid>
        <List
          className={classes.expansionPanelContainer}
          dense
          style={{ height: dense ? '32.5rem' : '280px' }}
        >
          {currentData.map(el => (
            <ListItem key={el.indicatorName} button>
              <ListItemText onClick={() => onItemClick(el.indicatorName)}>
                <Grid container>
                  <Grid item xs={6}>
                    {el.indicatorName}
                  </Grid>
                  <Grid
                    item
                    xs={3}
                    style={{ alignSelf: 'center', textAlign: 'right' }}
                  >
                    {el['last updated']}
                  </Grid>
                  <Grid
                    item
                    xs={3}
                    style={{ alignSelf: 'center', textAlign: 'right' }}
                  >
                    {numeral(getLatestIndValue(el.data)).format('0.0[0]a')}
                  </Grid>
                </Grid>
              </ListItemText>
            </ListItem>
            // <ExpansionPanelBlock
            //   indicatorData={el}
            //   key={el.indicatorName}
            //   yearRange={[2010, 2019]}
            //   dense={dense}
            // />
          ))}
        </List>
      </div>
    </Paper>
  );
};

const mapStateToProps = state => ({
  metaData: state.homepageDataTrendsStore.metaData || [],
});

const mapDispatchToProps = dispatch => {
  return {
    initDataTrendsMetaLoad: requestParams =>
      dispatch(initDataTrendsMetaLoad(requestParams)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DashboardIndSearch);
