import { applyMiddleware, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { composeWithDevTools } from 'redux-devtools-extension/logOnlyInProduction';

import rootReducer from './rootReducer';
// const composeEnhancers =
//   process.env.NODE_ENV === 'development'
//     ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
//     : compose;

export const sagaMiddleware = createSagaMiddleware();

const composeEnhancers = composeWithDevTools({
  // options like actionSanitizer, stateSanitizer
});

export const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(sagaMiddleware)),
);
