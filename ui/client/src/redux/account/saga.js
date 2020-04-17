import axios from 'axios';
import { put, takeLatest } from 'redux-saga/effects';
import { INIT_USER_DATA_LOAD } from '../actionTypes';
import { TRAFFICKING_DATA_GET_USER_DATA_URL } from '../constRequestURLs';
import { useCookies } from 'react-cookie';
import * as actions from './actions';

function* workerUserDataSaga(bodyRequest) {
  let totalData;
  try {
    yield put(actions.startUserDataLoad());
    totalData = yield axios({
      method: 'post',
      url: TRAFFICKING_DATA_GET_USER_DATA_URL,
      headers: {},
      data: bodyRequest.payload || {},
    });
    yield put(actions.finishUserDataLoad(totalData.data));
  } catch (error) {
    yield put(
      actions.errorUserDataLoad({ errorMessage: 'Could not load data' }),
    );
    console.error(error);
  }
}

export function* watchUserDataSaga() {
  yield takeLatest(INIT_USER_DATA_LOAD, workerUserDataSaga);
}
