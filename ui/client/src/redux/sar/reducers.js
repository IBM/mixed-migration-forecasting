import {
  START_SAR_LOAD,
  FINISH_SAR_LOAD,
  ERROR_SAR_LOAD,
  SAVE_SAR_IMAGE,
} from '../actionTypes';
import { stateUpdater } from '../stateUpdater';

const initialState = {
  isLoading: true,
  isError: false,
  errorMessage: '',
  homePageImage: '',
  sar: undefined,
};
const startSarLoad = state => {
  return stateUpdater(state, {
    isLoading: true,
  });
};

const finishSarLoad = (state, action) => {
  return stateUpdater(state, {
    isLoading: false,
    isError: false,
    errorMessage: '',
    sar: [...action.payload],
  });
};

const errorSarLoad = (state, action) => {
  return stateUpdater(state, {
    isLoading: false,
    isError: true,
    errorMessage: action.payload.errorMessage,
  });
};

const saveSarImage = (state, action) => {
  return stateUpdater(state, {
    isLoading: false,
    isError: false,
    errorMessage: '',
    homePageImage: action.payload,
  });
};

export const sarReducer = (state = initialState, action) => {
  switch (action.type) {
    case START_SAR_LOAD: {
      return startSarLoad(state);
    }
    case FINISH_SAR_LOAD: {
      return finishSarLoad(state, action);
    }
    case ERROR_SAR_LOAD: {
      return errorSarLoad(state, action);
    }
    case SAVE_SAR_IMAGE: {
      return saveSarImage(state, action);
    }
    default:
      return state;
  }
};
