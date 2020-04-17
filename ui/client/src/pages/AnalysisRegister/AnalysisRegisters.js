import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import ReactHtmlParser from 'react-html-parser';
import { initSarLoad } from '../../redux/sar/actions';
import { initSingleSarLoad } from '../../redux/sarSinglePage/actions';
import { makeStyles } from '@material-ui/core/styles';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import SearchIcon from '@material-ui/icons/Search';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { A, usePath } from 'hookrouter';
import Container from '@material-ui/core/Container';
import LinearProgress from '@material-ui/core/LinearProgress';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Box from '@material-ui/core/Box';
import Link from '@material-ui/core/Link';

import ReportCard from '../../components/ReportCard/ReportCard';
import { Title, SubTitle } from '../../components/common';
import ExpansionPanelBlock from './../../components/HomePageSearch/ExpansionPanel/ExpansionPanelBlock/ExpansionPanelBlock';
import analysisRegister from './AnalysisRegister.theme';
import overviewImage from '../../static/images/SitRepOverviewImg.jpg';

const useStyles = makeStyles(analysisRegister);
const AnalysisRegisters = props => {
  let reportContent = { title: '', conclusion: '', status: '', author: '' };
  const {
    _id,
    title,
    conclusions,
    status,
    authors,
    img,
    file,
    filesMeta,
    filesId,
    dataTrends,
    err,
  } = props.reportStore.reportData || reportContent;
  const currDataTrends = dataTrends && JSON.parse(dataTrends);
  const classes = useStyles();
  const location = usePath();
  const latestReportId = props.sar.sar ? props.sar.sar[0]._id : null;
  useEffect(() => {
    props.initSarLoad();
  }, []);
  useEffect(() => {
    props.initSingleSarLoad();
  }, []);
  return (
    <Container maxWidth="lg">
      <div className={classes.mainPageContainer}>
        <A className={classes.createReportBtn} href={'/analysis-report'}>
          <Button color="primary" size="small" variant="contained">
            Create New Report
          </Button>
        </A>
        <Typography
          align="center"
          className={classes.toolbarTitle}
          component="h3"
          noWrap
          variant="h3"
        >
          Situational Assessment Reports
        </Typography>
        <TextField
          id="input-with-icon-textfield"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          margin="dense"
          placeholder="Title, authors, contents"
          variant="outlined"
        />
      </div>
      <Grid
        container
        direction="row-reverse"
        spacing={2}
        style={{ paddingBottom: '1.5rem' }}
      >
        {props.reportStore.isLoading ? (
          <LinearProgress
            color="secondary"
            style={{ width: '100%', margin: '.3rem 0' }}
          />
        ) : null}
        <Grid item lg={5} md={12} style={{ overflow: 'hidden' }}>
          <img alt="" className={classes.img} src={overviewImage} style={{}} />
        </Grid>
        <Grid item lg={7} md={12}>
          <Typography align="left" component="h4" gutterBottom variant="h4">
            {title}
          </Typography>
          <SubTitle>
            Author: {authors} | Status: {status}
          </SubTitle>
          {/* {currDataTrends ? (
            <Grid container spacing={1}>
              {Object.keys(currDataTrends).map(el => (
                <Grid item key={el} xs={12}>
                  <ExpansionPanel>
                    <ExpansionPanelSummary
                      expandIcon={<ExpandMoreIcon style={{ color: '#fff' }} />}
                      aria-controls="panel1a-content"
                      id="panel1a-header"
                      style={{
                        backgroundColor: '#666',
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        className={classes.title}
                        style={{ color: '#fff' }}
                      >
                        {el}
                      </Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                      <Box style={{ flexGrow: '1' }}>
                        {Object.keys(currDataTrends[el]).map(item => {
                          if (currDataTrends[el][item]) {
                            return (
                              <ExpansionPanelBlock
                                backgroundColor="#666"
                                indicatorData={currDataTrends[el][item]}
                                key={item}
                                noDetails={true}
                                textColor="#fff"
                                yearRange={[2010, 2019]}
                              />
                            );
                          }
                        })}
                      </Box>
                    </ExpansionPanelDetails>
                  </ExpansionPanel>
                </Grid>
              ))}
            </Grid>
          ) : null} */}
          {conclusions ? (
            <Grid
              container
              style={{
                maxHeight: '300px',
                overflow: 'hidden',
                marginBottom: '1rem',
              }}
            >
              <div>{ReactHtmlParser(conclusions)}</div>
            </Grid>
          ) : null}
          <A
            className={classes.headlineLink}
            href={`/analysis-register/${_id}`}
          >
            <Button
              color="primary"
              onClick={() => window.scrollTo(0, 0)}
              size="small"
              variant="contained"
            >
              Go to a report &#8594;
            </Button>
          </A>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        {props.sar.isLoading ? (
          <LinearProgress
            color="secondary"
            style={{ width: '100%', margin: '.3rem 0' }}
          />
        ) : null}
        {props.sar.sar &&
          props.sar.sar.map(card => {
            return (
              <Grid item key={card._id} xs={6} md={4} lg={3}>
                <ReportCard
                  id={card._id}
                  author={card.authors}
                  conclusion={card.conclusions}
                  key={card._id}
                  img={card.img}
                  status={card.status}
                  title={card.title}
                />
              </Grid>
            );
          })}
      </Grid>
    </Container>
  );
};
const mapStateToProps = state => ({
  sar: state.sarStore,
  reportStore: state.singleSarStore || null,
});
const mapDispatchToProps = dispatch => ({
  initSarLoad: () => dispatch(initSarLoad()),
  initSingleSarLoad: request => dispatch(initSingleSarLoad(request)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AnalysisRegisters);
