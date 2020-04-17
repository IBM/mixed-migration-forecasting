import axios from 'axios';
import { put, takeLatest } from 'redux-saga/effects';
import { INIT_MAP_DATA_LOAD } from '../actionTypes';
import {
  COUNTRIES_CENTROIDS_GET_URL,
  TRAFFICKING_DATA_GET_COUNTRIES_INCIDENTS_YEARLY_URL,
  MIXED_MIGRATION_DATA_COUNTRIES_INDICATORS_YEARLY_URL,
  GET_INDICATOR_CODE_BY_NAME,
} from '../constRequestURLs';
import * as actions from './actions';

const initialRequest = {
  indicator: 'DRC.TOT.DISP',
  years: '2000-2019',
};

const setParamsObject = (object, victimsData, maxCircleRadius, maxValue) => {
  return {
    name: object.Country,
    latitude: +object.Longitude.replace(',', '.'),
    longitude: +object.Latitude.replace(',', '.'),
    country: object['Country code'],
    fillKey: 'bubble',
    yeild: victimsData,
    radius:
      Math.ceil((maxCircleRadius * ((victimsData * 100) / maxValue)) / 100) + 2,
  };
};

/**
 * Maps incidents data with coordinates and formates it to use in BubbleMap
 * @param {Object} victimsList - Number of incidents by country grouped by year
 * @param {Array} countriesList - Array of Country objects that contains Country Name, Country Alpha3 Code, Longitude&Latitude
 */
const mergeRecordsWithCountries = (victimsList, countriesList) => {
  let updatedCoutriesList = {};
  const maxValueArray = [];
  const maxCircleRadius = 120;
  Object.keys(victimsList.data).forEach(year => {
    maxValueArray.push(...Object.values(victimsList.data[year]));
  });
  const maxValue = Math.max(...maxValueArray);
  Object.keys(victimsList.data).forEach(year => {
    Object.keys(victimsList.data[year]).forEach(country => {
      if (victimsList.data[year][country] === 0) return;
      let currentObject = countriesList.data.filter(
        element => element['Country code'] === country,
      )[0];
      if (currentObject) {
        if (!updatedCoutriesList[year]) {
          updatedCoutriesList[year] = [
            setParamsObject(
              currentObject,
              victimsList.data[year][country],
              maxCircleRadius,
              maxValue,
            ),
          ];
        } else {
          updatedCoutriesList[year].push(
            setParamsObject(
              currentObject,
              victimsList.data[year][country],
              maxCircleRadius,
              maxValue,
            ),
          );
        }
      }
    });
  });
  return updatedCoutriesList;
};

function* workerMapDataSaga(requestBody) {
  try {
    yield put(actions.startMapDataLoad());
    const indicatorCode = yield axios({
      method: 'get',
      url: GET_INDICATOR_CODE_BY_NAME,
      headers: {},
      params: {
        indicator:
          (requestBody.payload && requestBody.payload.indicator) ||
          'Total forced displacement',
      },
    });
    const countriesList = yield axios({
      method: 'get',
      url: COUNTRIES_CENTROIDS_GET_URL,
      headers: {},
    });
    const indicatorList = yield axios({
      method: 'post',
      url: MIXED_MIGRATION_DATA_COUNTRIES_INDICATORS_YEARLY_URL,
      headers: {},
      data: { ...requestBody, indicator: indicatorCode.data } || initialRequest,
    });
    const indicatorName = Object.keys(indicatorList.data)[0];
    const processedCountriesList = mergeRecordsWithCountries(
      indicatorList.data[indicatorName],
      countriesList,
    );
    yield put(
      actions.finishMapDataLoad({
        victimsList: processedCountriesList,
      }),
    );
  } catch (error) {
    yield put(
      actions.errorMapDataLoad({ errorMessage: 'Could not load data for map' }),
    );
    console.error(error);
  }
}

export function* watchMapDataSaga() {
  yield takeLatest(INIT_MAP_DATA_LOAD, workerMapDataSaga);
}
