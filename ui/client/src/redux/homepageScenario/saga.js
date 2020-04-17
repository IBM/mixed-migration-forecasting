import axios from 'axios';
import { put, takeLatest, all } from 'redux-saga/effects';
import {
  INIT_FORECAST_DATA_LOAD,
  INIT_SCENARIO_DATA_LOAD,
} from '../actionTypes';
import { GET_FORESIGHT_SCENARIOS } from '../constRequestURLs';
import * as actions from './actions';

function* workerScenarioDataSaga(requestParams) {
  let totalData;
  try {
    yield put(actions.startScenarioDataLoad());
    totalData = yield axios({
      method: 'get',
      url: GET_FORESIGHT_SCENARIOS,
      headers: {},
    });
    yield put(actions.finishScenarioDataLoad(totalData.data));
  } catch (error) {
    yield put(
      actions.errorScenarioDataLoad({
        errorMessage: 'Could not load data',
      }),
    );
    console.error(error);
  }
}

export function* watchScenarioDataSaga() {
  yield all([takeLatest(INIT_SCENARIO_DATA_LOAD, workerScenarioDataSaga)]);
}
