import axios from 'axios';
import { put, takeLatest } from 'redux-saga/effects';
import {
  INIT_USER_ACTION,
  START_USER_ACTION_CREATE,
  START_USER_ACTION_DELETE,
  START_USER_ACTION_EDIT,
} from '../actionTypes';
import {
  USER_DATA_UPDATE,
  USER_DATA_CREATE,
  USER_DATA_DELETE,
} from '../constRequestURLs';
import * as actions from './actions';

const createUserHandler = data => {
  axios({
    method: 'post',
    url: USER_DATA_CREATE,
    headers: {},
    data,
  });
};

const editUserHandler = data => {
  axios({
    method: 'post',
    url: USER_DATA_UPDATE,
    headers: {},
    data,
  });
};

const deleteUserHandler = data => {
  axios({
    method: 'delete',
    url: USER_DATA_DELETE,
    headers: {},
    data,
  });
};

function* workerUserAction(payload) {
  try {
    yield put(actions.startUserAction());
    switch (payload.payload.type) {
      case START_USER_ACTION_CREATE: {
        return createUserHandler(payload.payload.data);
      }
      case START_USER_ACTION_EDIT: {
        return editUserHandler(payload.payload.data);
      }
      case START_USER_ACTION_DELETE: {
        return deleteUserHandler(payload.payload.data);
      }
      default:
        return '';
    }
  } catch (error) {
    yield put(actions.errorUserAction({ errorMessage: 'Could not load data' }));
    console.error(error);
  }
}

export function* watchUserActionSaga() {
  yield takeLatest(INIT_USER_ACTION, workerUserAction);
}
