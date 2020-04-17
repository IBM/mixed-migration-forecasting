import {
  START_INDICATORS_LOAD,
  FINISH_INDICATORS_LOAD,
  ERROR_INDICATORS_LOAD,
} from '../actionTypes';
import { stateUpdater } from '../stateUpdater';

const initialState = {
  isLoading: true,
  isError: false,
  errorMessage: '',
  indicators: [],
};

const startIndicatorsLoad = state => {
  return stateUpdater(state, {
    isLoading: true,
  });
};

const finishIndicatorsLoad = (state, action) => {
  return stateUpdater(state, {
    isLoading: false,
    isError: false,
    errorMessage: '',
    indicators: action.payload,
  });
};

const errorIndicatorsLoad = (state, action) => {
  return stateUpdater(state, {
    isLoading: false,
    isError: true,
    errorMessage: action.payload.errorMessage,
  });
};

export const indicatorsReducer = (state = initialState, action) => {
  switch (action.type) {
    case START_INDICATORS_LOAD: {
      return startIndicatorsLoad(state);
    }
    case FINISH_INDICATORS_LOAD: {
      return finishIndicatorsLoad(state, action);
    }
    case ERROR_INDICATORS_LOAD: {
      return errorIndicatorsLoad(state, action);
    }
    default:
      return state;
  }
};
