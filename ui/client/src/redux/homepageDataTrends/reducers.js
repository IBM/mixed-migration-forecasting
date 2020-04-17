import {
  START_DATA_TRENDS_LOAD,
  FINISH_DATA_TRENDS_LOAD,
  ERROR_DATA_TRENDS_LOAD,
  START_DATA_TRENDS_META_LOAD,
  FINISH_DATA_TRENDS_META_LOAD,
  ERROR_DATA_TRENDS_META_LOAD,
} from '../actionTypes';
import { stateUpdater } from '../stateUpdater';

const initialState = {
  isDataTrendsLoading: true,
  isDataTrendsError: false,
  isDataTrendsMetaLoading: true,
  isDataTrendsMetaError: false,
  errorMessageMeta: '',
  errorMessage: '',
  dataTrends: [],
  metaData: [],
};

const startDataTrendsLoad = state => {
  return stateUpdater(state, {
    isDataTrendsLoading: true,
  });
};

const finishDataTrendsLoad = (state, action) => {
  return stateUpdater(state, {
    isDataTrendsLoading: false,
    isDataTrendsError: false,
    errorMessage: '',
    dataTrends: action.payload.data,
    countryName: action.payload.countryName,
  });
};

const errorDataTrendsLoad = (state, action) => {
  return stateUpdater(state, {
    isDataTrendsLoading: false,
    isDataTrendsError: true,
    errorMessage: action.payload.errorMessage,
  });
};

const startDataTrendsMetaLoad = state => {
  return stateUpdater(state, {
    isDataTrendsMetaLoading: true,
  });
};

const finishDataTrendsMetaLoad = (state, action) => {
  return stateUpdater(state, {
    isDataTrendsMetaLoading: false,
    isDataTrendsMetaError: false,
    errorMessageMeta: '',
    metaData: action.payload.data,
  });
};

const errorDataTrendsMetaLoad = (state, action) => {
  return stateUpdater(state, {
    isDataTrendsMetaLoading: false,
    isDataTrendsMetaError: true,
    errorMessageMeta: action.payload.errorMessage,
  });
};

export const homepagDataTrendsReducer = (state = initialState, action) => {
  switch (action.type) {
    case START_DATA_TRENDS_LOAD: {
      return startDataTrendsLoad(state);
    }
    case FINISH_DATA_TRENDS_LOAD: {
      return finishDataTrendsLoad(state, action);
    }
    case ERROR_DATA_TRENDS_LOAD: {
      return errorDataTrendsLoad(state, action);
    }
    case START_DATA_TRENDS_META_LOAD: {
      return startDataTrendsMetaLoad(state);
    }
    case FINISH_DATA_TRENDS_META_LOAD: {
      return finishDataTrendsMetaLoad(state, action);
    }
    case ERROR_DATA_TRENDS_META_LOAD: {
      return errorDataTrendsMetaLoad(state, action);
    }
    default:
      return state;
  }
};
