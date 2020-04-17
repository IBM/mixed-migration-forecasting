import axios from 'axios';
import { put, takeLatest } from 'redux-saga/effects';
import { INIT_USER_LIST_DATA_LOAD } from '../actionTypes';
import { TRAFFICKING_DATA_GET_USER_LIST_DATA } from '../constRequestURLs';
import * as actions from './actions';

function* workerUserListDataSaga() {
  let totalData;
  try {
    yield put(actions.startUserListDataLoad());
    totalData = yield axios({
      method: 'get',
      url: TRAFFICKING_DATA_GET_USER_LIST_DATA,
      headers: {},
    });
    yield put(actions.finishUserListDataLoad(totalData.data));
  } catch (error) {
    yield put(
      actions.errorUserListDataLoad({ errorMessage: 'Could not load data' }),
    );
    console.error(error);
  }
}

export function* watchUserListSaga() {
  yield takeLatest(INIT_USER_LIST_DATA_LOAD, workerUserListDataSaga);
}
