import {
  INIT_FORECAST_DATA_LOAD,
  START_FORECAST_DATA_LOAD,
  FINISH_FORECAST_DATA_LOAD,
  ERROR_FORECAST_DATA_LOAD,
  INIT_USER_FORECAST_DATA_LOAD,
  START_USER_FORECAST_DATA_LOAD,
  FINISH_USER_FORECAST_DATA_LOAD,
  ERROR_USER_FORECAST_DATA_LOAD,
} from '../actionTypes';

export const initForecastDataLoad = payload => {
  return {
    type: INIT_FORECAST_DATA_LOAD,
    payload,
  };
};

export const startForecastDataLoad = payload => {
  return {
    type: START_FORECAST_DATA_LOAD,
    payload,
  };
};

export const finishForecastDataLoad = payload => {
  return {
    type: FINISH_FORECAST_DATA_LOAD,
    payload,
  };
};

export const errorForecastDataLoad = payload => {
  return {
    type: ERROR_FORECAST_DATA_LOAD,
    payload,
  };
};

export const initUserForecastDataLoad = payload => {
  return {
    type: INIT_USER_FORECAST_DATA_LOAD,
    payload,
  };
};

export const startUserForecastDataLoad = payload => {
  return {
    type: START_USER_FORECAST_DATA_LOAD,
    payload,
  };
};

export const finishUserForecastDataLoad = payload => {
  return {
    type: FINISH_USER_FORECAST_DATA_LOAD,
    payload,
  };
};

export const errorUserForecastDataLoad = payload => {
  return {
    type: ERROR_USER_FORECAST_DATA_LOAD,
    payload,
  };
};
