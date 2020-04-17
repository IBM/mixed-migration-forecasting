import axios from 'axios';
import { put, takeLatest } from 'redux-saga/effects';
import { INIT_COUNTRY_GENERIC_DATA_LOAD } from '../actionTypes';
import {
  WORLDBANK_DATA_GET_COUNTRY_BY_YEAR,
  MIXED_MIGRATION_DATA_LATEST_INDICATOR,
} from '../constRequestURLs';
import * as actions from './actions';

const initialRequest = {
  years: 1,
  country: 'AFG',
  indicator: 'IDP',
};

function* workerGenericDataSaga(requestBody) {
  try {
    let result;
    yield put(actions.startCountryGenDataLoad());
    result = yield axios({
      method: 'post',
      url: MIXED_MIGRATION_DATA_LATEST_INDICATOR,
      headers: {},
      data: requestBody.payload || initialRequest,
    });
    yield put(actions.finishCountryGenDataLoad(result.data));
  } catch (error) {
    yield put(
      actions.errorCountryGenDataLoad({
        errorMessage: 'Unable to receive generic country data.',
      }),
    );
    console.error(error);
  }
}

export function* watchGenericDataSaga() {
  yield takeLatest(INIT_COUNTRY_GENERIC_DATA_LOAD, workerGenericDataSaga);
}
