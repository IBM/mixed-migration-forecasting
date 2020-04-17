const express = require('express');
const axios = require('axios');
const cfenv = require('cfenv');

const router = express.Router();

const appEnv = cfenv.getAppEnv();

const foresightApiURL =
  process.env.FORESIGHT_API_URL ||
  appEnv.FORESIGHT_API_URL ||
  'https://foresight.eu-gb.mybluemix.net';

router.post('/countries-indicator-by-year', async (req, res) => {
  try {
    const { indicator = 'UNHCR.EDP', years = '2000-2019' } = req.body;
    const indicators = await axios({
      method: 'get',
      url: `${foresightApiURL}/indicators`,
      headers: {},
      params: {
        indicator: indicator,
        years: years,
        country: 'all',
      },
    });
    const responce = {};
    let tempArr = indicators.data;
    tempArr.forEach(el => {
      responce[el['Indicator Name']] = responce[el['Indicator Name']] || {
        source: el['sourceFileName'] || '',
        data: {},
      };
      responce[el['Indicator Name']].data[el.year] =
        responce[el['Indicator Name']].data[el.year] || {};
      responce[el['Indicator Name']].data[el.year][el['Country Code']] =
        el.value;
    });
    res.json(responce);
  } catch (err) {
    console.log('Error:', err);
    res.json({ err: err.message });
  }
});

router.post('/country-indicators', async (req, res) => {
  try {
    const {
      countries = 'AFG',
      indicators = 'DRC.TOT.DISP',
      years = '2017',
    } = req.body;
    const indicatorData = await axios({
      method: 'get',
      url: `${foresightApiURL}/indicators`,
      headers: {},
      params: {
        country: countries,
        indicator: indicators,
        years: years,
      },
    });
    const responce = {};
    let tempArr = [...indicatorData.data];
    tempArr.forEach(el => {
      responce[el['Country Code']] = responce[el['Country Code']] || {};
      responce[el['Country Code']][el['Indicator Name']] = responce[
        el['Country Code']
      ][el['Indicator Name']] || {
        source: el['sourceFileName'] || '',
        data: {},
      };
      responce[el['Country Code']][el['Indicator Name']].data[el.year] =
        el.value;
    });
    res.json(responce);
  } catch (err) {
    console.log('Error:', err);
    res.json({ err: err.message });
  }
});

router.post('/main-data-trends', async (req, res) => {
  try {
    const { countries = 'AFG', yearRange = '2010-2019' } = req.body;
    const indicators = await axios({
      method: 'get',
      url: `${foresightApiURL}/indicators`,
      headers: {},
      params: {
        indicator: 'all',
        country: countries,
        years: yearRange,
      },
    });
    const responce = {};
    let tempArr = [...indicators.data];
    tempArr.forEach(el => {
      responce[el['Country Code']] = responce[el['Country Code']] || {};
      responce[el['Country Code']][el['Indicator Name']] = responce[
        el['Country Code']
      ][el['Indicator Name']] || {
        'Indicator Code': el['Indicator Code'] || '',
        data: {},
      };
      responce[el['Country Code']][el['Indicator Name']].data[el.year] =
        el.value;
    });
    res.json(responce);
  } catch (err) {
    console.log('Error:', err);
    res.json({ err: err.message });
  }
});

router.post('/indicators-by-years', async (req, res) => {
  try {
    const {
      countries = 'AFG',
      yearRange = '1990-2019',
      indicator = 'Internally displaced persons',
    } = req.body;
    const indicatorCode = await axios({
      method: 'get',
      url: `${foresightApiURL}/indicatorCodeByName`,
      headers: {},
      params: {
        indicator: indicator,
      },
    });
    const ind = await axios({
      method: 'get',
      url: `${foresightApiURL}/indicators`,
      headers: {},
      params: {
        country: countries,
        indicator: indicatorCode.data,
        years: yearRange,
      },
    });
    res.json(ind.data);
  } catch (err) {
    console.log('Error:', err);
    res.json({ err: err.message });
  }
});

router.get('/indicator-names', async (req, res) => {
  try {
    const ind = await axios({
      method: 'get',
      url: `${foresightApiURL}/uniqueIndicatorNames`,
      headers: {},
    });
    res.json(ind.data);
  } catch (err) {
    console.log('Error:', err);
    res.json({ err: err.message });
  }
});

router.get('/indicator-code-by-name', async (req, res) => {
  try {
    const ind = await axios({
      method: 'get',
      url: `${foresightApiURL}/indicatorCodeByName`,
      headers: {},
      params: req.query,
    });
    res.json(ind.data);
  } catch (err) {
    console.log('Error:', err);
    res.json({ err: err.message });
  }
});

router.get('/indicator-outliers', async (req, res) => {
  try {
    const ind = await axios({
      method: 'get',
      url: `${foresightApiURL}/outliers`,
      headers: {},
      params: req.query,
    });
    res.json(ind.data);
  } catch (err) {
    console.log('Error:', err);
    res.json({ err: err.message });
  }
});

router.get('/indicators-metadata', async (req, res) => {
  try {
    const ind = await axios({
      method: 'get',
      url: `${foresightApiURL}/indicatorMetadata`,
      headers: {},
    });
    res.json(ind.data);
  } catch (err) {
    console.log('Error:', err);
    res.json({ err: err.message });
  }
});

router.get('/foresight-predict', async (req, res) => {
  try {
    const ind = await axios({
      method: 'get',
      url: `${foresightApiURL}/predict`,
      headers: {},
      params: req.query,
    });
    res.json(ind.data);
  } catch (err) {
    console.log('Error:', err);
    res.json({ err: err.message });
  }
});

router.get('/foresight-scenarios', async (req, res) => {
  try {
    const ind = await axios({
      method: 'get',
      url: `${foresightApiURL}/scenarios`,
      headers: {},
      params: req.query,
    });
    res.json(ind.data);
  } catch (err) {
    console.log('Error:', err);
    res.json({ err: err.message });
  }
});

router.get('/available-countries', async (req, res) => {
  try {
    const resp = await axios({
      method: 'get',
      url: `${foresightApiURL}/countries`,
      headers: {},
    });
    res.json(resp.data);
  } catch (err) {
    console.log('Error:', err);
    res.json({ err: err.message });
  }
});

router.post('/latest-country-indicator', async (req, res) => {
  try {
    const indicators = await axios({
      method: 'get',
      url: `${foresightApiURL}/latestIndicators`,
      headers: {},
      params: req.body,
    });
    const responce = indicators.data;
    res.json(responce);
  } catch (err) {
    console.log('Error:', err);
    res.json({ err: err.message });
  }
});

module.exports = router;
