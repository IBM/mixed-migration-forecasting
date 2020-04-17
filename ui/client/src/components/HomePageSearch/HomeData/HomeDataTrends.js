import React from 'react';
import { connect } from 'react-redux';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import ExpansionPanelBlock from '../ExpansionPanel/ExpansionPanelBlock/ExpansionPanelBlock';
import ExpansionMenuHeader from '../DataTrendsMenuHeader/DataTrendsMenuHeader';
import homeDataTrends from './HomeDataTrends.theme';
import { initDataTrendsMetaLoad } from '../../../redux/homepageDataTrends/actions';
import InfoIcon from '@material-ui/icons/Info';
import GetAppIcon from '@material-ui/icons/GetApp';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import LinearProgress from '@material-ui/core/LinearProgress';
import Skeleton from 'react-loading-skeleton';

const useStyles = makeStyles(homeDataTrends);

const HomePageSearch = props => {
  const { dataTrends, metaData, dense, titleVariant, size = 1 } = props;
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
  const downloadCsv = (yearRange = [2010, 2019]) => {
    const yearsNumber = yearRange[yearRange.length - 1] - yearRange[0] + 1;
    const tempYearArray = Array.from(new Array(yearsNumber), (val, index) =>
      (yearRange[0] + index).toString(),
    );
    let csvContent = `data:text/csv;charset=utf-8,${[
      'Country',
      'Indicator Name',
      'Indicator Code',
      'Detail',
      'Source',
      'Last Updated',
      ...tempYearArray,
    ]}\n${currentData
      .map(el =>
        [
          props.countryName,
          el.indicatorName,
          el['Indicator Code'],
          el.detail,
          el.source,
          el['last updated'],
          ...tempYearArray.map(year => el.data[year] || 'N/A'),
        ].join(','),
      )
      .join('\n')}`;
    let link = document.createElement('a');
    link.href = csvContent;
    const fileName = `Data trends ${props.countryName}.csv`;
    link.download = fileName;
    link.click();
  };
  const classes = useStyles();
  return (
    <Paper
      className={classes.paper}
      style={{ backgroundColor: '#666', color: '#fff' }}
    >
      <div className={classes.root}>
        <Typography
          color="primary"
          component="h6"
          gutterBottom
          style={{ color: '#fff', display: 'flex' }}
          variant={titleVariant || 'h6'}
        >
          Data trends for {props.countryName}
          <Tooltip
            title={
              <div style={{ fontSize: '1rem', lineHeight: '1.3rem' }}>
                <h3>Component info:</h3>
                The Data trends control provides the user with the ability to
                search & view all of the data indicators included in the system.
                Using the search bar the user can isolate indicators of interest
                based on a free text search of the indicator name and the
                source. The summary displayfor each indicator includes the
                indicator name, the source of the indicator data and the most
                recent value for that indicator (based on year). It is possible
                for the user to expand an indicator by clicking on it to display
                additional information including the details of the indicator
                and when the data for that indicator was last updated in the
                system. In the “Trend” section there is a spark line display of
                how the data for the indicator changes over time, by hovering on
                the spark line the user can see the values by year within the
                line graph.
                <h3>Interaction info:</h3>
                This control interacts with the Forecast control to alter the
                forecast based on country selected in the Map.
              </div>
            }
            arrow
          >
            <Button
              style={{
                color: '#fbc02d',
                padding: '0',
                minWidth: 'unset',
                marginLeft: '5px',
              }}
            >
              <InfoIcon />
            </Button>
          </Tooltip>
          <Box
            style={{
              flexGrow: '1',
              justifyContent: 'flex-end',
              display: 'flex',
            }}
          >
            <Button
              style={{
                color: '#fff',
                padding: '0',
                minWidth: 'unset',
                marginLeft: '5px',
              }}
              onClick={() => downloadCsv()}
            >
              <GetAppIcon />
            </Button>
          </Box>
        </Typography>
        <TextField
          className={classes.searchInput}
          color="secondary"
          label="Search"
          margin="dense"
          onChange={filterDataTrends}
          variant="outlined"
          InputProps={{ style: { backgroundColor: '#ddd' } }}
        />
        {dense ? null : <ExpansionMenuHeader dense={dense} />}
        {props.isDataLoading || props.isMetaLoading ? (
          <Skeleton height={`${280 * size}px`} width="100%" />
        ) : (
          <div
            className={classes.expansionPanelContainer}
            style={{ height: `${280 * size}px` }}
          >
            {currentData.map(el => (
              <ExpansionPanelBlock
                indicatorData={el}
                key={el.indicatorName}
                yearRange={[2010, 2019]}
                dense={dense}
              />
            ))}
          </div>
        )}
      </div>
    </Paper>
  );
};

const mapStateToProps = state => ({
  metaData: state.homepageDataTrendsStore.metaData || [],
  isDataLoading: state.homepageDataTrendsStore.isDataTrendsLoading,
  isMetaLoading: state.homepageDataTrendsStore.isDataTrendsMetaLoading,
});

const mapDispatchToProps = dispatch => {
  return {
    initDataTrendsMetaLoad: requestParams =>
      dispatch(initDataTrendsMetaLoad(requestParams)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(HomePageSearch);
