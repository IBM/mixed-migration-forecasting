import React, { useState } from 'react';
import { navigate } from 'hookrouter';
import { connect } from 'react-redux';
import numeral from 'numeral';

import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';

import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Container from '@material-ui/core/Container';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import GetAppIcon from '@material-ui/icons/GetApp';
import { makeStyles } from '@material-ui/core/styles';

import analysisReport from './AnalysisReport.theme';

import { initDataTrendsLoad } from '../../redux/homepageDataTrends/actions';
import { initDataTrendsMetaLoad } from '../../redux/homepageDataTrends/actions';
import { initScenarioDataLoad } from '../../redux/homepageScenario/actions';
import { initSarLoad } from '../../redux/sar/actions';
import { initUserListDataLoad } from '../../redux/userList/actions';
import ExpansionPanelBlock from './../../components/HomePageSearch/ExpansionPanel/ExpansionPanelBlock/ExpansionPanelBlock';
import { Title, SubTitle } from '../../components/common';

const useStyles = makeStyles(analysisReport);

const keyInd = {
  Economy: [
    'GDP per capita, PPP (current international $)',
    'Inflation, consumer prices (annual %)',
    'Unemployment, total (% of total labor force) (modeled ILO estimate)',
  ],
  Conflict: [
    'Battle-related deaths (number of people)',
    'ACLED total number of violent incidents annually.',
  ],
  Governance: [
    'DRC Collected Corruption Index',
    'ACLED total number of violent incidents annually.',
    'Political Rights',
    'State Legitimacy',
    'Public Services',
  ],
  Natural: [
    'EMDAT estimate of occurrence for Natural disaster group',
    'Renewable internal freshwater resources per capita (cubic meters)',
    'Water productivity, total (constant 2010 US$ GDP per cubic meter of total freshwater withdrawal)',
  ],
  Population: ['Refugees and IDPs', 'Urban population growth (annual %)'],
};

const toBase64 = file =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

const AnalysisReport = props => {
  const classes = useStyles();
  const {
    homepageDataTrends,
    metaData,
    countryCode,
    currentUser,
    usersList,
  } = props;
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('');
  const [author, setAuthor] = useState(
    `${currentUser.first_name} ${currentUser.last_name}`,
  );
  const [report, setReport] = useState('');
  const [files, setFiles] = useState([]);

  React.useEffect(() => {
    props.initDataTrendsLoad({
      countries: countryCode,
      yearRange: '2010-2019',
    });
    props.initDataTrendsMetaLoad();
    props.initUserListLoad();
    props.initScenarioDataLoad();
  }, []);

  const dataTrends = homepageDataTrends[Object.keys(homepageDataTrends)[0]];

  const changeTitle = e => {
    setTitle(e.target.value);
  };

  const changeStatus = e => {
    setStatus(e.target.value);
  };

  const changeAuthor = e => {
    setAuthor(e.target.value);
  };

  const onSubmit = async e => {
    e.preventDefault();
    if (title && status && report && author) {
      const tempFile = (files[0] && (await toBase64(files[0]))) || null;
      const tempFiles = [];
      if (files) {
        const tempFileArray = Array.from(files);
        for (let el of tempFileArray) {
          const temp = await toBase64(files[tempFileArray.indexOf(el)]);
          tempFiles.push({
            fileName: el.name,
            fileString: temp,
            fileSize: el.size,
          });
        }
      }
      let dataTrends = {};

      Object.keys(keyInd).map(el => {
        dataTrends[el] = {};
        keyInd[el].map(item => {
          if (
            data.length > 0 &&
            data.filter(el => el.indicatorName === item)[0]
          ) {
            dataTrends[el][item] = data.filter(
              temp => temp.indicatorName === item,
            )[0];
          }
        });
      });
      // const tempFiles = files && await Array.from(files).map(async (item,i)=>{const tempFile = await toBase64(files[i]); return {fileName: item.name, fileString: tempFile}});
      await props.initSarLoad({
        report: {
          title: title,
          authors: author,
          conclusions: report,
          status: status,
          dataTrends: JSON.stringify(dataTrends),
          img: props.homePageImage,
          file: tempFile || null,
          files: tempFiles || null,
        },
      });
      await navigate('/analysis-register');
    } else {
      alert('Verification faild, be sure to fill all fields!');
    }
  };
  const changeReport = content => {
    setReport(content); //Get Content Inside Editor
  };
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

  return (
    <section className={classes.root}>
      <Container maxWidth="xl">
        <form onSubmit={onSubmit}>
          <Typography
            align="center"
            className={classes.pageTitle}
            component="h4"
            variant="h4"
          >
            New Situational Assessment Reports
          </Typography>
          <Grid
            container
            justify="space-between"
            spacing={3}
            style={{ marginBottom: '0' }}
          >
            <Grid item lg={6} sm={12}>
              {props.homePageImage !== '' ? (
                <Box style={{ maxHeight: '240px', overflow: 'auto' }}>
                  <img src={props.homePageImage} style={{ width: '100%' }} />
                </Box>
              ) : null}
              <SubTitle>Key Indicators</SubTitle>
              <Grid container spacing={1}>
                {Object.keys(keyInd).map(el => (
                  <Grid key={el} item xs={12}>
                    <ExpansionPanel>
                      <ExpansionPanelSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                      >
                        <Typography
                          variant="subtitle1"
                          className={classes.title}
                        >
                          {el}
                        </Typography>
                      </ExpansionPanelSummary>
                      <ExpansionPanelDetails>
                        <Box style={{ flexGrow: '1' }}>
                          {keyInd[el].map(item => {
                            if (
                              data.length > 0 &&
                              data.filter(el => el.indicatorName === item)[0]
                            ) {
                              return (
                                <ExpansionPanelBlock
                                  backgroundColor="#fff"
                                  indicatorData={
                                    data.filter(
                                      el => el.indicatorName === item,
                                    )[0]
                                  }
                                  key={item}
                                  noDetails={true}
                                  textColor="#000"
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
            </Grid>
            <Grid item lg={6} sm={12}>
              <Paper className={classes.paper}>
                <Grid container spacing={1}>
                  <Grid item md={6} sm={12} xs={12}>
                    <SubTitle>Title</SubTitle>
                    <TextField
                      fullWidth
                      onChange={changeTitle}
                      placeholder="Enter title of the report"
                      size="small"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item md={3} sm={12} xs={12}>
                    <SubTitle>Status</SubTitle>
                    <FormControl size="small" fullWidth variant="outlined">
                      <Select
                        id="demo-simple-select-outlined"
                        onChange={changeStatus}
                        value={status}
                      >
                        <MenuItem value="Draft">Draft</MenuItem>
                        <MenuItem value="Under Review">Under Review</MenuItem>
                        <MenuItem value="Final">Final</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item md={3} sm={12} xs={12}>
                    <SubTitle>Authors</SubTitle>
                    <FormControl fullWidth size="small" variant="outlined">
                      <Select
                        id="demo-simple-select-outlined"
                        onChange={changeAuthor}
                        defaultValue={author}
                      >
                        {usersList.map(el => (
                          <MenuItem
                            key={`${el.first_name} ${el.last_name}`}
                            value={`${el.first_name} ${el.last_name}`}
                          >{`${el.first_name} ${el.last_name}`}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item md={12} sm={12} xs={12}>
                    <SubTitle>
                      Objectives, Analysis Details, Conclusions
                    </SubTitle>
                    <SunEditor
                      onChange={changeReport}
                      setOptions={{
                        minHeight: 300,
                        buttonList: [
                          ['undo', 'redo', 'font', 'fontSize', 'formatBlock'],
                          ['bold', 'underline', 'italic', 'removeFormat'],
                          '/'[ // Line break
                            ('fontColor',
                            'hiliteColor',
                            'outdent',
                            'indent',
                            'align',
                            'horizontalRule',
                            'list',
                            'table')
                          ],
                          [
                            'image',
                            'video',
                            'fullScreen',
                            'showBlocks',
                            'codeView',
                            'preview',
                            'print',
                            'save',
                          ],
                        ],
                      }}
                    />
                    <div>
                      <input
                        onChange={e => setFiles(e.target.files)}
                        type="file"
                        name="filefield"
                        multiple="multiple"
                      />
                      {files.length > 0 ? (
                        <Grid constiner>
                          <Grid item lg={6} xs={12}>
                            <Table className={classes.table}>
                              <TableHead>
                                <TableRow>
                                  <TableCell padding="none">
                                    <SubTitle>File Name</SubTitle>
                                  </TableCell>
                                  <TableCell align="right" padding="none">
                                    <SubTitle>File Size</SubTitle>
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {Array.from(files).map(el => (
                                  <TableRow key={el.name}>
                                    <TableCell
                                      component="th"
                                      padding="none"
                                      scope="row"
                                    >
                                      {el.name}
                                    </TableCell>
                                    <TableCell align="right" padding="none">
                                      {numeral(el.size).format('0.0[0] b') ||
                                        ''}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </Grid>
                        </Grid>
                      ) : null}
                    </div>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            {/* <Grid item md={6} sm={12} xs={12}>
            <Title>Title</Title>
            <TextField
              fullWidth
              onChange={changeTitle}
              placeholder="Enter title of the report"
              variant="outlined"
            />
          </Grid>
          <Grid item md={3} sm={12} xs={12}>
            <Title>Status</Title>
            <FormControl fullWidth variant="outlined">
              <Select
                id="demo-simple-select-outlined"
                onChange={changeStatus}
                value={status}
              >
                <MenuItem value="Draft">Draft</MenuItem>
                <MenuItem value="Under Review">Under Review</MenuItem>
                <MenuItem value="Final">Final</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item md={3} sm={12} xs={12}>
            <Title>Authors</Title>
            <FormControl fullWidth variant="outlined">
              <Select
                id="demo-simple-select-outlined"
                onChange={changeAuthor}
                value={author}
              >
                <MenuItem value="Aliaksandr">Aliaksandr</MenuItem>
                <MenuItem value="Siarhei">Siarhei</MenuItem>
                <MenuItem value="John">John</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item md={12} sm={12} style={{ marginTop: '30px' }} xs={12}>
            <Title>Key Indicators</Title>
            <Grid container>
              {Object.keys(keyInd).map(el => (
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" className={classes.title}>
                    {el}
                  </Typography>
                  <div className={classes.demo}>
                    <List dense>
                      {keyInd[el].map(item => (
                        <ListItem>
                          <ListItemText primary={item} />
                        </ListItem>
                      ))}
                    </List>
                  </div>
                </Grid>
              ))}
            </Grid>
          </Grid>
          {props.homePageImage !== '' ? (
            <Grid item md={12} sm={12} xs={12}>
              <Paper className={classes.paper}>
                <img src={props.homePageImage} style={{ width: '100%' }} />
              </Paper>
            </Grid>
          ) : null}
          <Grid item md={12} sm={12} style={{ marginTop: '30px' }} xs={12}>
            <Title>Objectives, Analysis Details, Conclusions</Title>
            <SunEditor
              onChange={changeReport}
              setOptions={{
                minHeight: 300,
                buttonList: [
                  ['undo', 'redo', 'font', 'fontSize', 'formatBlock'],
                  ['bold', 'underline', 'italic', 'removeFormat'],
                  '/'[ // Line break
                    ('fontColor',
                    'hiliteColor',
                    'outdent',
                    'indent',
                    'align',
                    'horizontalRule',
                    'list',
                    'table')
                  ],
                  [
                    'image',
                    'video',
                    'fullScreen',
                    'showBlocks',
                    'codeView',
                    'preview',
                    'print',
                    'save',
                  ],
                ],
              }}
            />
            <div>
              <input
                onChange={e => setFiles(e.target.files)}
                type="file"
                name="filefield"
                multiple="multiple"
              />
              {files.length > 0
                ? Array.from(files).map(file => (
                    <p>
                      {file.name} | {file.size}
                    </p>
                  ))
                : null}
            </div>
          </Grid> */}
            <Grid
              className={classes.btnBlock}
              item
              md={12}
              sm={12}
              style={{ marginTop: '30px' }}
              xs={12}
            >
              <Button
                className={classes.actionBtn}
                onClick={() => navigate('/analysis-register')}
                variant="contained"
              >
                Cancel
              </Button>
              <Button
                className={classes.actionBtn}
                color="primary"
                type="submit"
                variant="contained"
              >
                Save
              </Button>
            </Grid>
          </Grid>
        </form>
      </Container>
    </section>
  );
};

const mapStateToProps = state => ({
  homePageImage: state.sarStore.homePageImage,
  homepageDataTrends: state.homepageDataTrendsStore.dataTrends,
  metaData: state.homepageDataTrendsStore.metaData || [],
  countryCode: state.filterStore.selectedCategories.Country[0],
  currentUser: state.userDataStore.userData || {},
  usersList: state.userListStore.userList,
});

const mapDispatchToProps = dispatch => ({
  initUserListLoad: () => dispatch(initUserListDataLoad()),
  initScenarioDataLoad: () => dispatch(initScenarioDataLoad()),
  initSarLoad: data => dispatch(initSarLoad(data)),
  initDataTrendsLoad: requestBody => dispatch(initDataTrendsLoad(requestBody)),
  initDataTrendsMetaLoad: requestParams =>
    dispatch(initDataTrendsMetaLoad(requestParams)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AnalysisReport);
