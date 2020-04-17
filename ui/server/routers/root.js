const express = require('express');

const indicatorsRouter = require('./indicator-provison/indicator.handler');
const userMngrRouter = require('./user-managment/userMngmnt.handler');
const sitRepRouter = require('./sit-report/sitRep.handler');

const mongoHelpers = require('../helpers/mongoose.helper');

const router = express.Router();

router.use('/', indicatorsRouter);
router.use('/', userMngrRouter);
router.use('/', sitRepRouter);

router.post('/finalngo/incident-records-filtered', async (req, res) => {
  try {
    const responce = await mongoHelpers.getFilteredData(req.body);
    res.json(responce);
  } catch (err) {
    console.log('Error:', err);
    res.json({ err: err.message });
  }
});

// router.get('/finalngo/incident-records-set', async (req, res) => {
//   try {
//     const responce = await mongoHelpers.setFilteredData();
//     res.json(responce);
//   } catch (err) {
//     console.log('Error:', err);
//     res.json({ err: err.message });
//   }
// });

router.post('/finalngo/incident-categories-filtered', async (req, res) => {
  try {
    const { requestedCategories, filterOptions } = req.body;
    const responce = await mongoHelpers.getCategoriesOptions(
      requestedCategories,
      filterOptions,
    );
    res.json(responce);
  } catch (err) {
    console.log('Error:', err);
    res.json({ err: err.message });
  }
});

router.post('/finalngo/incidents-by-country', async (req, res) => {
  try {
    // NOTE: forbiden for now, not using it, also route not optimized
    // const responce = await mongoHelpers.getIncidentsByCountriesCount(req.body);
    // res.json(responce);
    res.status(403);
    res.send();
  } catch (err) {
    console.log('Error:', err);
    res.json({ err: err.message });
  }
});

router.get('/finalngo/countries-incidents-by-year', async (req, res) => {
  try {
    const responce = await mongoHelpers.getCountryIncidentsByYear();
    res.json(responce);
  } catch (err) {
    console.log('Error:', err);
    res.json({ err: err.message });
  }
});

router.get('/countries-centroids', async (req, res) => {
  try {
    const responce = await mongoHelpers.getCountriesCoordinates();
    res.json(responce);
  } catch (err) {
    console.log('Error:', err);
    res.json({ err: err.message });
  }
});

router.post('/generic-country-data', async (req, res) => {
  try {
    const { year, countryCode } = req.body;
    const responce = await mongoHelpers.getGenericCountryData(
      year,
      countryCode,
    );
    res.json(responce);
  } catch (err) {
    console.log('Error:', err);
    res.json({ err: err.message });
  }
});

module.exports = router;
