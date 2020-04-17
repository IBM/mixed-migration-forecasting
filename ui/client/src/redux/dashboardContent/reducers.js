import {
  START_FILTERED_DATA_LOAD,
  FINISH_FILTERED_DATA_LOAD,
  ERROR_FILTERED_DATA_LOAD,
} from '../actionTypes';
import { stateUpdater } from '../stateUpdater';

const initialState = {
  isLoading: true,
  isError: false,
  errorMessage: '',
  filterData: [],
  filterOptions: {},
};
const startFilteredDataLoad = state => {
  return stateUpdater(state, {
    isLoading: true,
  });
};

const finishFilteredDataLoad = (state, action) => {
  return stateUpdater(state, {
    isLoading: false,
    isError: false,
    errorMessage: '',
    filterData: {
      ...state.filterData,
      [Object.keys(action.payload)[0]]:
        action.payload[Object.keys(action.payload)[0]],
    },
  });
};

const errorFilteredDataLoad = (state, action) => {
  return stateUpdater(state, {
    isLoading: false,
    isError: true,
    errorMessage: action.payload.errorMessage,
  });
};

export const dashboardContentReducer = (state = initialState, action) => {
  switch (action.type) {
    case START_FILTERED_DATA_LOAD: {
      return startFilteredDataLoad(state);
    }
    case FINISH_FILTERED_DATA_LOAD: {
      return finishFilteredDataLoad(state, action);
    }
    case ERROR_FILTERED_DATA_LOAD: {
      return errorFilteredDataLoad(state, action);
    }
    default:
      return state;
  }
};
