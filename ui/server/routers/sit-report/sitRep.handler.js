const express = require('express');
const ObjectID = require('mongodb').ObjectID;

const mongoHelpers = require('../../helpers/mongoose.helper');

const router = express.Router();

router.get('/sar-all-reports', async (req, res) => {
  try {
    const responce = await mongoHelpers.getAllSAReports();
    res.json(responce);
  } catch (err) {
    console.log('Error:', err);
    res.json({ err: err.message });
  }
});

router.post('/sar-get-report', async (req, res) => {
  try {
    const responce = await mongoHelpers.getSingleSAReport(req.body.id);
    res.json(responce);
  } catch (err) {
    console.log('Error:', err);
    res.json({ err: err.message });
  }
});

router.post('/sar-create-report', async (req, res) => {
  try {
    const { report } = req.body;
    const { title, authors, conclusions, img, status, dataTrends } = report;
    const filesId = new ObjectID();
    const tempReport = {
      title,
      authors,
      conclusions,
      img,
      status,
      dataTrends,
      filesId: filesId,
      filesMeta: report.files.map(el => ({
        fileName: el.fileName,
        fileSize: el.fileSize,
      })),
    };
    const tempFilesData = report.files.map(el => ({
      sitRepFileId: filesId,
      fileName: el.fileName,
      fileEncoded: el.fileString,
    }));
    const responce = await mongoHelpers.setNewSAReport(tempReport);
    const responceFiles = await mongoHelpers.setSitRepFiles(tempFilesData);
    res.json({ ...responce, ...responceFiles });
  } catch (err) {
    console.log('Error:', err);
    res.json({ err: err.message });
  }
});

router.post('/sit-rep-get-file', async (req, res) => {
  try {
    const fileData = req.body;
    const responce = await mongoHelpers.getSitRepFileByNameAndSarId(fileData);
    // const string = responce.fileEncoded;
    // const base64ContentArray = string.split(',');
    // const mimeType = base64ContentArray[0].match(
    //   /[^:\s*]\w+\/[\w-+\d.]+(?=[;| ])/,
    // )[0];
    // const data = base64ContentArray[1];
    // const buffer = Buffer.from(data, 'base64');
    // res.set({
    //   'Cache-Control': 'no-cache',
    //   'Content-Type': mimeType,
    //   'Content-Disposition': 'attachment; filename=' + responce.fileName,
    // });
    res.send(responce.fileEncoded);
  } catch (err) {
    console.log('Error:', err);
    res.json({ err: err.message });
  }
});

router.post('/sar-leave-comment', async (req, res) => {
  try {
    const { commentData } = req.body;
    const responce = await mongoHelpers.setSitRepComment(commentData);
    res.json(responce);
  } catch (err) {
    console.log('Error:', err);
    res.json({ err: err.message });
  }
});

router.post('/sar-get-comments', async (req, res) => {
  try {
    const { reportId } = req.body;
    const responce = await mongoHelpers.getSitRepComments(reportId);
    res.json(responce);
  } catch (err) {
    console.log('Error:', err);
    res.json({ err: err.message });
  }
});

module.exports = router;
