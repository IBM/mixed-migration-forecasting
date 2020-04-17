import axios from 'axios';
import { put, takeLatest } from 'redux-saga/effects';
import { INIT_FILTERED_DATA_LOAD } from '../actionTypes';
import { TRAFFICKING_DATA_GET_INCIDENT_RECORDS_FILTERED_URL } from '../constRequestURLs';
import * as actions from './actions';

const initialRequest = {
  'Incident Report Year': [2019],
};
function* workerFilteredDataSaga(requestBody) {
  let totalData;
  try {
    yield put(actions.startFilteredDataLoad());
    totalData = yield axios({
      method: 'post',
      url: TRAFFICKING_DATA_GET_INCIDENT_RECORDS_FILTERED_URL,
      headers: {},
      data: requestBody.payload || initialRequest,
    });
    yield put(actions.finishFilteredDataLoad(totalData.data));
  } catch (error) {
    yield put(
      actions.errorFilteredDataLoad({ errorMessage: 'Could not load data' }),
    );
    console.error(error);
  }
}

export function* watchFilteredDataSaga() {
  yield takeLatest(INIT_FILTERED_DATA_LOAD, workerFilteredDataSaga);
}
