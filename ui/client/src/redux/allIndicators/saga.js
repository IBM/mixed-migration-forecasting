import axios from 'axios';
import { put, takeLatest } from 'redux-saga/effects';
import { INIT_INDICATORS_LOAD } from '../actionTypes';
import { GET_ALL_INDICATORS } from '../constRequestURLs';
import * as actions from './actions';

function* workerIndicatorsSaga() {
  try {
    yield put(actions.startIndicatorsLoad());
    const resp = yield axios({
      method: 'get',
      url: GET_ALL_INDICATORS,
      headers: {},
    });
    yield put(actions.finishIndicatorsLoad(resp.data));
  } catch (error) {
    yield put(actions.errorIndicatorsLoad('Load error'));
    console.error(error);
  }
}

export function* watchIndicatorsSaga() {
  yield takeLatest(INIT_INDICATORS_LOAD, workerIndicatorsSaga);
}
