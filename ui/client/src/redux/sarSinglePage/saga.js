import axios from 'axios';
import { put, takeLatest } from 'redux-saga/effects';
import { INIT_SINGLE_SAR_LOAD } from '../actionTypes';
import { GET_SINGLE_SAR_URL } from '../constRequestURLs';
import * as actions from './actions';

function* workerSingleSarSaga(requestBody) {
  let sarData;
  try {
    yield put(actions.startSingleSarLoad());
    sarData = yield axios({
      method: 'post',
      url: GET_SINGLE_SAR_URL,
      headers: {},
      data: requestBody.payload,
    });
    yield put(actions.finishSingleSarLoad(sarData.data));
  } catch (error) {
    yield put(
      actions.errorSingleSarLoad({ errorMessage: 'Could not load data' }),
    );
    console.error(error);
  }
}

export function* watchSingleSarSaga() {
  yield takeLatest(INIT_SINGLE_SAR_LOAD, workerSingleSarSaga);
}
