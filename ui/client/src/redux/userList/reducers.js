import {
  START_USER_LIST_DATA_LOAD,
  FINISH_USER_LIST_DATA_LOAD,
  ERROR_USER_LIST_DATA_LOAD,
} from '../actionTypes';
import { stateUpdater } from '../stateUpdater';

const initialState = {
  isLoading: true,
  isError: false,
  errorMessage: '',
  userList: [],
};
const startUserListDataLoad = state => {
  return stateUpdater(state, {
    isLoading: true,
  });
};

const finishUserListDataLoad = (state, action) => {
  return stateUpdater(state, {
    isLoading: false,
    isError: false,
    errorMessage: '',
    userList: action.payload,
  });
};

const errorUserListDataLoad = (state, action) => {
  return stateUpdater(state, {
    isLoading: false,
    isError: true,
    errorMessage: action.payload.errorMessage,
  });
};

export const userListDataReducer = (state = initialState, action) => {
  switch (action.type) {
    case START_USER_LIST_DATA_LOAD: {
      return startUserListDataLoad(state);
    }
    case FINISH_USER_LIST_DATA_LOAD: {
      return finishUserListDataLoad(state, action);
    }
    case ERROR_USER_LIST_DATA_LOAD: {
      return errorUserListDataLoad(state, action);
    }
    default:
      return state;
  }
};
