import * as actionTypes from '../actionTypes';
import { stateUpdater } from '../stateUpdater';

const initialState = {
  isLoading: true,
  isError: false,
  errorMessage: '',
  mapData: {},
};
const startMapDataLoad = state => {
  return stateUpdater(state, {
    isLoading: true,
  });
};

const finishMapDataLoad = (state, action) => {
  return stateUpdater(state, {
    isLoading: false,
    isError: false,
    errorMessage: '',
    mapData: action.payload,
  });
};

const errorMapDataLoad = (state, action) => {
  return stateUpdater(state, {
    isLoading: false,
    isError: true,
    errorMessage: action.payload.errorMessage,
  });
};

export const mapDataReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.START_MAP_DATA_LOAD: {
      return startMapDataLoad(state);
    }
    case actionTypes.FINISH_MAP_DATA_LOAD: {
      return finishMapDataLoad(state, action);
    }
    case actionTypes.ERROR_MAP_DATA_LOAD: {
      return errorMapDataLoad(state, action);
    }
    default:
      return state;
  }
};
