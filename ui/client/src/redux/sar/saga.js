import axios from 'axios';
import { put, takeLatest } from 'redux-saga/effects';
import { INIT_SAR_LOAD } from '../actionTypes';
import { GET_SAR_URL, SET_SAR_URL } from '../constRequestURLs';
import * as actions from './actions';

function* workerSarSaga(data) {
  let sarData;
  try {
    yield put(actions.startSarLoad());
    if (!data.payload) {
      sarData = yield axios({
        method: 'get',
        url: GET_SAR_URL,
        headers: {},
      });
    } else {
      sarData = yield axios({
        method: 'post',
        url: SET_SAR_URL,
        headers: {},
        data: data.payload,
      });
    }
    yield put(actions.finishSarLoad(sarData.data));
  } catch (error) {
    yield put(actions.errorSarLoad({ errorMessage: 'Could not load data' }));
    console.error(error);
  }
}

export function* watchSarSaga() {
  yield takeLatest(INIT_SAR_LOAD, workerSarSaga);
}
