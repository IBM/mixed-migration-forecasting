import {
  INIT_COUNTRY_GENERIC_DATA_LOAD,
  START_COUNTRY_GENERIC_DATA_LOAD,
  FINISH_COUNTRY_GENERIC_DATA_LOAD,
  ERROR_COUNTRY_GENERIC_DATA_LOAD,
} from '../actionTypes';

export const initCountryGenDataLoad = payload => {
  return {
    type: INIT_COUNTRY_GENERIC_DATA_LOAD,
    payload,
  };
};

export const startCountryGenDataLoad = payload => {
  return {
    type: START_COUNTRY_GENERIC_DATA_LOAD,
    payload,
  };
};

export const finishCountryGenDataLoad = payload => {
  return {
    type: FINISH_COUNTRY_GENERIC_DATA_LOAD,
    payload,
  };
};

export const errorCountryGenDataLoad = payload => {
  return {
    type: ERROR_COUNTRY_GENERIC_DATA_LOAD,
    payload,
  };
};
