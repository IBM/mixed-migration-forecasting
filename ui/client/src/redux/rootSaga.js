import { all, spawn, call } from 'redux-saga/effects';
import * as allWatchers from './watchers';

const sagas = Object.values(allWatchers).map(saga =>
  spawn(function* startSaga() {
    while (true) {
      try {
        yield call(saga);
        break;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Saga error:', error);
      }
    }
  }),
);

export default function* rootSaga() {
  yield all([...sagas]);
}
