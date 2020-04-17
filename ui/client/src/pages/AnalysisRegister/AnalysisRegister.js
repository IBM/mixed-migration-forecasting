import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import ReactHtmlParser from 'react-html-parser';
import axios from 'axios';
import numeral from 'numeral';
import html2canvas from 'html2canvas';

import { initSingleSarLoad } from '../../redux/sarSinglePage/actions';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import { usePath, navigate } from 'hookrouter';
import Container from '@material-ui/core/Container';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import LinearProgress from '@material-ui/core/LinearProgress';
import GetAppIcon from '@material-ui/icons/GetApp';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import analysisRegister from './AnalysisRegister.theme';
import { Title, SubTitle } from '../../components/common';
import ExpansionPanelBlock from './../../components/HomePageSearch/ExpansionPanel/ExpansionPanelBlock/ExpansionPanelBlock';
import jsPDF from 'jspdf';

const useStyles = makeStyles(analysisRegister);

const saveByteArray = (reportName, byte) => {
  // const blob = new Blob([byte.data], { type: byte.headers['content-type'] });
  let link = document.createElement('a');
  link.href = byte.data;
  const fileName = reportName;
  link.download = fileName;
  link.click();
};

const AnalysisRegister = props => {
  const [isFileLoading, setIsFileLoading] = React.useState(false);
  const [comment, setComment] = React.useState('');
  const [comments, setComments] = React.useState([]);
  const classes = useStyles();
  const pathname = usePath();
  const downloadFile = async (fileName, filesId) => {
    setIsFileLoading(true);
    const dataBuffer = await axios({
      method: 'post',
      url: '/api/sit-rep-get-file',
      headers: {},
      data: { fileName, sitRepFileId: filesId },
    });
    saveByteArray(fileName, dataBuffer);
    setIsFileLoading(false);
  };
  const downloadReport = async () => {
    let imageDataString = null;
    window.scrollTo(0, 0);
    try {
      const homePageSar = document.getElementById('sar-container');
      const htmlCanvas = await html2canvas(homePageSar, {
        useCORS: true,
        logging: false,
      });
      imageDataString = htmlCanvas.toDataURL();
      var doc = new jsPDF();
      doc.addImage(imageDataString, 'PNG', 15, 15, 180, 240);
      const pdfFile = doc.output('dataurlstring');
      saveByteArray(title, { data: pdfFile });
    } catch (error) {
      console.log('[imageDataString] Err:', error);
    }
  };
  useEffect(() => {
    const reportId = pathname.split('/')[pathname.split('/').length - 1];
    props.initSingleSarLoad({ id: reportId });
    const tempFunc = async () => {
      const resp = await axios({
        method: 'post',
        url: '/api/sar-get-comments',
        headers: {},
        data: { reportId: reportId },
      });
      setComments(resp.data);
    };
    tempFunc();
  }, []);
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
  if (err) navigate('/404');
  const currDataTrends = dataTrends && JSON.parse(dataTrends);
  const onComment = async () => {
    const commentData = {
      sitRepId: _id,
      userName: props.userData.first_name,
      userLastName: props.userData.last_name,
      commentText: comment,
    };
    await axios({
      method: 'post',
      url: '/api/sar-leave-comment',
      headers: {},
      data: { commentData },
    });
    const resp = await axios({
      method: 'post',
      url: '/api/sar-get-comments',
      headers: {},
      data: { reportId: _id },
    });
    setComments(resp.data);
    setComment('');
  };

  return (
    <Container maxWidth="lg">
      <Paper>
        <Grid id="sar-container" style={{ padding: '1rem' }} container>
          {props.reportStore.isLoading ? (
            <LinearProgress
              color="secondary"
              style={{ width: '100%', margin: '.3rem 0' }}
            />
          ) : null}
          <Grid item xs={12}>
            <Typography
              align="center"
              className={classes.pageTitle}
              component="h4"
              variant="h4"
            >
              {title}
            </Typography>
          </Grid>
          <Grid
            item
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
            xs={12}
          >
            <SubTitle>Author: {authors}</SubTitle>
            <SubTitle>Status: {status}</SubTitle>
          </Grid>
          <Grid item xs={12}>
            <img
              alt=""
              className={classes.img}
              src={img}
              style={{ width: '100%' }}
            />
          </Grid>
          {currDataTrends ? (
            <Grid item xs={12}>
              <Title>Key Indicators</Title>
              <Grid container spacing={1}>
                {Object.keys(currDataTrends).map(el => (
                  <Grid item key={el} xs={6}>
                    <Typography variant="subtitle1" className={classes.title}>
                      {el}
                    </Typography>
                    <Box style={{ flexGrow: '1' }}>
                      {Object.keys(currDataTrends[el]).map(item => {
                        if (currDataTrends[el][item]) {
                          return (
                            <ExpansionPanelBlock
                              backgroundColor="#fff"
                              indicatorData={currDataTrends[el][item]}
                              key={item}
                              noDetails={true}
                              textColor="#000"
                              yearRange={[2010, 2019]}
                            />
                          );
                        }
                      })}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          ) : null}
          <Grid item style={{ maxWidth: '100%', overflow: 'auto' }} xs={12}>
            <Title>Analysis Details</Title>
            {ReactHtmlParser(conclusions)}
          </Grid>
          <Grid item style={{ maxWidth: '100%', overflow: 'auto' }} xs={12}>
            <Button
              color="primary"
              onClick={downloadReport}
              variant="contained"
            >
              Download this Report
            </Button>
          </Grid>
          <Grid item md={6} xs={12}>
            {file ? (
              <Title>
                <a href={file}>Download attachment</a>
              </Title>
            ) : null}
            {filesMeta && filesMeta.length > 0 ? (
              <React.Fragment>
                <Title>Attachments</Title>
                <Table className={classes.table}>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <SubTitle>File Name</SubTitle>
                      </TableCell>
                      <TableCell align="right">
                        <SubTitle>File Size</SubTitle>
                      </TableCell>
                      <TableCell align="right">
                        <SubTitle>Download</SubTitle>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filesMeta.map(el => (
                      <TableRow key={el.fileName}>
                        <TableCell component="th" scope="row">
                          {el.fileName}
                        </TableCell>
                        <TableCell align="right">
                          {numeral(el.fileSize).format('0.0[0] b') || ''}
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            color="primary"
                            disabled={isFileLoading}
                            onClick={() => downloadFile(el.fileName, filesId)}
                            style={{
                              padding: '0',
                              minWidth: 'auto',
                            }}
                          >
                            <GetAppIcon />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </React.Fragment>
            ) : null}
          </Grid>
          {comments.length > 0 ? (
            <Grid item md={12}>
              <Title>Comments</Title>
              {comments.map(el => (
                <React.Fragment>
                  <SubTitle>
                    {el.userName} {el.userLastName}
                  </SubTitle>
                  <p>{el.commentText}</p>
                </React.Fragment>
              ))}
            </Grid>
          ) : null}
          <Grid item md={12}>
            <Title>Leave a Comment</Title>
            <Box style={{ display: 'flex', flexDirection: 'row' }}>
              <TextField
                fullWidth
                multiline
                onChange={e => setComment(e.target.value)}
                placeholder="Enter your comment"
                rows="4"
                size="small"
                value={comment}
                variant="outlined"
              />
              <Button
                color="primary"
                disabled={!comment}
                onClick={onComment}
                variant="contained"
              >
                Send
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};
const mapStateToProps = state => ({
  reportStore: state.singleSarStore || null,
  userData: state.userDataStore.userData || null,
});
const mapDispatchToProps = dispatch => ({
  initSingleSarLoad: request => dispatch(initSingleSarLoad(request)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AnalysisRegister);
