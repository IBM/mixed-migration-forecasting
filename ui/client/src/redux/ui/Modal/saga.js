import { put, takeLatest } from 'redux-saga/effects';
import { INIT_MODAL } from '../../actionTypes';
import * as actions from './actions';

function* workerModal(action) {
  yield put(actions.showModal(action.payload));
}

export function* watchModal() {
  yield takeLatest(INIT_MODAL, workerModal);
}
