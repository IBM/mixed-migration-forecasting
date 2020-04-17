import axios from 'axios';
import { put, takeLatest, all } from 'redux-saga/effects';
import {
  INIT_DATA_TRENDS_LOAD,
  INIT_DATA_TRENDS_META_LOAD,
} from '../actionTypes';
import {
  GET_DATA_TRENDS_TEMP_URL,
  GET_INDICATORS_METADATA,
} from '../constRequestURLs';
import * as actions from './actions';

const initialRequest = {
  countries: 'AFG',
  yearRange: '2010-2019',
};

function* workerDataTrendsSaga(requestBody) {
  let totalData;
  try {
    yield put(actions.startDataTrendsLoad());
    totalData = yield axios({
      method: 'post',
      url: GET_DATA_TRENDS_TEMP_URL,
      headers: {},
      data:
        {
          countries: requestBody.payload.countries,
          yearRange: requestBody.payload.yearRange,
        } || initialRequest,
    });
    yield put(
      actions.finishDataTrendsLoad({
        data: totalData.data,
        countryName: requestBody.payload.countryName || 'Afghanistan',
      }),
    );
  } catch (error) {
    yield put(
      actions.errorDataTrendsLoad({ errorMessage: 'Could not load data' }),
    );
    console.error(error);
  }
}

function* workerDataTrendsMetaSaga() {
  let totalData;
  try {
    yield put(actions.startDataTrendsMetaLoad());
    totalData = yield axios({
      method: 'get',
      url: GET_INDICATORS_METADATA,
      headers: {},
    });
    yield put(
      actions.finishDataTrendsMetaLoad({
        data: totalData.data,
      }),
    );
  } catch (error) {
    yield put(
      actions.errorDataTrendsMetaLoad({ errorMessage: 'Could not load data' }),
    );
    console.error(error);
  }
}

export function* watchDataTrendsSaga() {
  yield all([
    takeLatest(INIT_DATA_TRENDS_LOAD, workerDataTrendsSaga),
    takeLatest(INIT_DATA_TRENDS_META_LOAD, workerDataTrendsMetaSaga),
  ]);
}
