import {
  START_SINGLE_SAR_LOAD,
  FINISH_SINGLE_SAR_LOAD,
  ERROR_SINGLE_SAR_LOAD,
} from '../actionTypes';
import { stateUpdater } from '../stateUpdater';

const initialState = {
  isLoading: true,
  isError: false,
  errorMessage: '',
  reportData: undefined,
};
const startSingleSarLoad = state => {
  return stateUpdater(state, {
    isLoading: true,
  });
};

const finishSingleSarLoad = (state, action) => {
  return stateUpdater(state, {
    isLoading: false,
    isError: false,
    errorMessage: '',
    reportData: action.payload,
  });
};

const errorSingleSarLoad = (state, action) => {
  return stateUpdater(state, {
    isLoading: false,
    isError: true,
    errorMessage: action.payload.errorMessage,
  });
};

export const singleSarReducer = (state = initialState, action) => {
  switch (action.type) {
    case START_SINGLE_SAR_LOAD: {
      return startSingleSarLoad(state);
    }
    case FINISH_SINGLE_SAR_LOAD: {
      return finishSingleSarLoad(state, action);
    }
    case ERROR_SINGLE_SAR_LOAD: {
      return errorSingleSarLoad(state, action);
    }
    default:
      return state;
  }
};
