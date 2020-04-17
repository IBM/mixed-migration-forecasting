import axios from 'axios';
import { put, takeLatest, all } from 'redux-saga/effects';
import { INIT_MENU_FILTERS, SELECT_MENU_FILTERS } from '../actionTypes';
import { TRAFFICKING_DATA_GET_INCIDENT_CATEGORIES_FILTERED_URL } from '../constRequestURLs';
import * as actions from './actions';

const initialRequest = {
  requestedCategories: [
    'Incident Report Year',
    'Country',
    'Victim Gender',
    'Trafficking Type',
  ],
};

function* workerFilterSaga(requestBody) {
  try {
    let result;
    yield put(actions.startCategoriesLoad());
    result = yield axios({
      method: 'post',
      url: TRAFFICKING_DATA_GET_INCIDENT_CATEGORIES_FILTERED_URL,
      headers: {},
      data: requestBody.payload || initialRequest,
    });
    yield put(actions.finishCategoriesLoad(result.data));
  } catch (error) {
    yield put(
      actions.errorCategoriesLoad({
        errorMessage: 'Unable to receive filtering categories.',
      }),
    );
    console.error(error);
  }
}

function* workerSelectFilterSaga(selectedCategories) {
  yield put(actions.submitSelectedCategories(selectedCategories.payload));
}

export function* watchFilterSaga() {
  all([
    yield takeLatest(SELECT_MENU_FILTERS, workerSelectFilterSaga),
    yield takeLatest(INIT_MENU_FILTERS, workerFilterSaga),
  ]);
}
