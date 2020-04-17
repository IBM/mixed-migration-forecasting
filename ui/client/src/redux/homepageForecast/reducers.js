import {
  START_FORECAST_DATA_LOAD,
  FINISH_FORECAST_DATA_LOAD,
  ERROR_FORECAST_DATA_LOAD,
  START_USER_FORECAST_DATA_LOAD,
  FINISH_USER_FORECAST_DATA_LOAD,
  ERROR_USER_FORECAST_DATA_LOAD,
} from '../actionTypes';
import { stateUpdater } from '../stateUpdater';

const initialState = {
  isForecastLoading: true,
  isUserForecastLoading: true,
  isForcastError: false,
  isUserForcastError: false,
  errorMessage: '',
  forecastData: {},
  userForecastData: {},
};

const startForecastDataLoad = state => {
  return stateUpdater(state, {
    isForecastLoading: true,
  });
};

const finishForecastDataLoad = (state, action) => {
  return stateUpdater(state, {
    isForecastLoading: false,
    isForcastError: false,
    errorMessage: '',
    forecastData: action.payload,
  });
};

const errorForecastDataLoad = (state, action) => {
  return stateUpdater(state, {
    isForecastLoading: false,
    isForcastError: true,
    errorMessage: action.payload.errorMessage,
  });
};

const startUserForecastDataLoad = state => {
  return stateUpdater(state, {
    isUserForecastLoading: true,
  });
};

const finishUserForecastDataLoad = (state, action) => {
  return stateUpdater(state, {
    isUserForecastLoading: false,
    isUserForcastError: false,
    errorMessage: '',
    userForecastData: action.payload,
  });
};

const errorUserForecastDataLoad = (state, action) => {
  return stateUpdater(state, {
    isUserForecastLoading: false,
    isUserForcastError: true,
    errorMessage: action.payload.errorMessage,
  });
};

export const homepageContentReducer = (state = initialState, action) => {
  switch (action.type) {
    case START_FORECAST_DATA_LOAD: {
      return startForecastDataLoad(state);
    }
    case FINISH_FORECAST_DATA_LOAD: {
      return finishForecastDataLoad(state, action);
    }
    case ERROR_FORECAST_DATA_LOAD: {
      return errorForecastDataLoad(state, action);
    }
    case START_USER_FORECAST_DATA_LOAD: {
      return startUserForecastDataLoad(state);
    }
    case FINISH_USER_FORECAST_DATA_LOAD: {
      return finishUserForecastDataLoad(state, action);
    }
    case ERROR_USER_FORECAST_DATA_LOAD: {
      return errorUserForecastDataLoad(state, action);
    }
    default:
      return state;
  }
};
