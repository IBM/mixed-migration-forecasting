import {
  INIT_FILTERED_DATA_LOAD,
  START_FILTERED_DATA_LOAD,
  FINISH_FILTERED_DATA_LOAD,
  ERROR_FILTERED_DATA_LOAD,
} from '../actionTypes';

export const initFilteredDataLoad = payload => {
  return {
    type: INIT_FILTERED_DATA_LOAD,
    payload,
  };
};

export const startFilteredDataLoad = payload => {
  return {
    type: START_FILTERED_DATA_LOAD,
    payload,
  };
};

export const finishFilteredDataLoad = payload => {
  return {
    type: FINISH_FILTERED_DATA_LOAD,
    payload,
  };
};

export const errorFilteredDataLoad = payload => {
  return {
    type: ERROR_FILTERED_DATA_LOAD,
    payload,
  };
};
