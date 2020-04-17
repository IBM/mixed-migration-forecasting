import axios from 'axios';
import { put, takeLatest, all, takeEvery } from 'redux-saga/effects';
import { INIT_CHART_LOAD, INIT_MAP_LOAD } from '../actionTypes';
import {
  MIXED_MIGRATION_DATA_COUNTRIES_INDICATORS_YEARLY_URL,
  MIXED_MIGRATION_DATA_INDICATOR_YEARLY_URL,
  GET_INDICATOR_CODE_BY_NAME,
  GET_INDICATOR_OUTLIERS,
} from '../constRequestURLs';
import * as actions from './actions';

const initialMapRequest = {
  indicator: 'UNHCR.OUT.REF',
  years: '2017',
};

const initialChartRequest = {
  countries: 'MMR',
  years: '1990-2019',
  indicators: 'IDP',
};

export const getNested = (obj, path) => {
  if (typeof path === 'string') {
    return path
      .split('.')
      .reduce((prev, curr) => (prev ? prev[curr] : null), obj);
  }
  if (Array.isArray(path)) {
    return path.reduce((prev, curr) => (prev ? prev[curr] : null), obj);
  }
  return null;
};

function* workerChartData(bodyRequest) {
  let totalData;
  const pieChartData = [];
  try {
    yield put(actions.startChartData());
    const indicatorCode = yield axios({
      method: 'get',
      url: GET_INDICATOR_CODE_BY_NAME,
      headers: {},
      params: {
        indicator:
          (bodyRequest.payload && bodyRequest.payload.indicators) ||
          'Internally displaced persons',
      },
    });

    totalData = yield axios({
      method: 'post',
      url: MIXED_MIGRATION_DATA_INDICATOR_YEARLY_URL,
      headers: {},
      data:
        { ...bodyRequest.payload, indicators: indicatorCode.data } ||
        initialChartRequest,
    });

    const outliers = yield axios({
      method: 'get',
      url: GET_INDICATOR_OUTLIERS,
      headers: {},
      params:
        {
          country: bodyRequest.payload.countries,
          indicator: indicatorCode.data,
        } || initialChartRequest,
    });

    const requestData = getNested(
      totalData,
      `data.${bodyRequest.payload.countries}.${bodyRequest.payload.indicators}.data`,
    );

    if (requestData) {
      Object.keys(requestData).forEach(element => {
        pieChartData.push({
          year: element,
          value: requestData[element],
          outlier: outliers.data[element],
        });
      });
    }

    const indicator = bodyRequest.payload.indicators;

    yield put(
      actions.finishFilteredDataLoad({
        [indicator]: pieChartData,
      }),
    );
  } catch (error) {
    console.error(error);
  }
}

function* workerMapData(bodyRequest) {
  let mapData;
  try {
    yield put(actions.startMapData());
    mapData = yield axios({
      method: 'post',
      url: MIXED_MIGRATION_DATA_COUNTRIES_INDICATORS_YEARLY_URL,
      headers: {},
      data: initialMapRequest || bodyRequest,
    });

    yield put(actions.finishFilteredDataLoad({ mapData: mapData.data }));
  } catch (error) {
    console.error(error);
  }
}

export function* watchFilteredDataSaga() {
  yield all([
    takeEvery(INIT_CHART_LOAD, workerChartData),
    takeLatest(INIT_MAP_LOAD, workerMapData),
  ]);
}
