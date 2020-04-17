import {
  START_USER_DATA_LOAD,
  FINISH_USER_DATA_LOAD,
  ERROR_USER_DATA_LOAD,
} from '../actionTypes';
import { stateUpdater } from '../stateUpdater';

const initialState = {
  isLoading: false,
  isError: false,
  errorMessage: '',
  userData: undefined,
};
const startUserDataLoad = state => {
  return stateUpdater(state, {
    isLoading: true,
  });
};

const finishUserDataLoad = (state, action) => {
  return stateUpdater(state, {
    isLoading: false,
    isError: false,
    errorMessage: '',
    userData: action.payload,
  });
};

const errorUserDataLoad = (state, action) => {
  return stateUpdater(state, {
    isLoading: false,
    isError: true,
    errorMessage: action.payload.errorMessage,
  });
};

export const userDataReducer = (state = initialState, action) => {
  switch (action.type) {
    case START_USER_DATA_LOAD: {
      return startUserDataLoad(state);
    }
    case FINISH_USER_DATA_LOAD: {
      return finishUserDataLoad(state, action);
    }
    case ERROR_USER_DATA_LOAD: {
      return errorUserDataLoad(state, action);
    }
    default:
      return state;
  }
};
