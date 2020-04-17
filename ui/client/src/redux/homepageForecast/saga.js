import axios from 'axios';
import { put, takeLatest, all } from 'redux-saga/effects';
import {
  INIT_FORECAST_DATA_LOAD,
  INIT_USER_FORECAST_DATA_LOAD,
} from '../actionTypes';
import {
  GET_FORECAST_LOCAL_URL,
  MIXED_MIGRATION_DATA_INDICATOR_YEARLY_URL,
  GET_FORESIGHT_PREDICT_DATA,
} from '../constRequestURLs';
import * as actions from './actions';

const initialStatRequest = {
  countries: 'AFG',
  years: '2010-2020',
  indicators: 'DRC.TOT.DISP',
};
const initialPredictRequest = {
  source: 'AFG',
};
function* workerForecastDataSaga(requestParams) {
  let totalData = {};
  try {
    yield put(actions.startForecastDataLoad());
    const tdpStatData = yield axios({
      method: 'post',
      url: MIXED_MIGRATION_DATA_INDICATOR_YEARLY_URL,
      headers: {},
      data: requestParams.payload || initialStatRequest,
    });
    const tdpPredictData = yield axios({
      method: 'get',
      url: GET_FORESIGHT_PREDICT_DATA,
      headers: {},
      params: requestParams.payload || initialPredictRequest,
    });
    totalData.tdpStat = {};
    totalData.tdpPredict = {};
    totalData.tdpPredictCI = {};
    totalData.country = requestParams.payload.source;
    if (tdpPredictData.data[0] && tdpPredictData.data[0].prediction) {
      tdpPredictData.data[0].prediction.forEach(item => {
        totalData.tdpPredict[item.year] = item.forecast;
        totalData.tdpPredictCI[item.year] = {
          max: item.CI_high || item.forecast,
          min: item.CI_low || item.forecast,
        };
      });
      totalData.explanation = tdpPredictData.data[0].explanation;
    }
    const countryData = tdpStatData.data[Object.keys(tdpStatData.data)[0]];
    for (let indicator in countryData) {
      for (let year in countryData[indicator].data) {
        totalData.tdpStat[year] =
          totalData.tdpStat[year] || 0 + countryData[indicator].data[year];
      }
    }
    yield put(actions.finishForecastDataLoad(totalData));
  } catch (error) {
    yield put(
      actions.errorForecastDataLoad({ errorMessage: 'Could not load data' }),
    );
    console.error(error);
  }
}
function* workerUserForecastDataSaga(requestParams) {
  let totalData = {};
  try {
    yield put(actions.startUserForecastDataLoad());
    const scenarioPredictData = yield axios({
      method: 'get',
      url: GET_FORESIGHT_PREDICT_DATA,
      headers: {},
      params: requestParams.payload || initialPredictRequest,
    });
    totalData.tdpPredict = {};
    totalData.tdpPredictCI = {};
    totalData.country = requestParams.payload.source;
    if (scenarioPredictData.data[0] && scenarioPredictData.data[0].prediction) {
      scenarioPredictData.data[0].prediction.forEach(item => {
        totalData.tdpPredict[item.year] = item.forecast;
        totalData.tdpPredictCI[item.year] = {
          max: item.CI_high || item.forecast,
          min: item.CI_low || item.forecast,
        };
      });
      totalData.explanation = scenarioPredictData.data[0].explanation;
    }
    yield put(actions.finishUserForecastDataLoad(totalData));
  } catch (error) {
    yield put(
      actions.errorUserForecastDataLoad({
        errorMessage: 'Could not load data',
      }),
    );
    console.error(error);
  }
}

export function* watchForecastDataSaga() {
  yield all([
    takeLatest(INIT_FORECAST_DATA_LOAD, workerForecastDataSaga),
    takeLatest(INIT_USER_FORECAST_DATA_LOAD, workerUserForecastDataSaga),
  ]);
}
