import {
  INIT_SINGLE_SAR_LOAD,
  START_SINGLE_SAR_LOAD,
  FINISH_SINGLE_SAR_LOAD,
  ERROR_SINGLE_SAR_LOAD,
} from '../actionTypes';

export const initSingleSarLoad = payload => {
  return {
    type: INIT_SINGLE_SAR_LOAD,
    payload,
  };
};

export const startSingleSarLoad = payload => {
  return {
    type: START_SINGLE_SAR_LOAD,
    payload,
  };
};

export const finishSingleSarLoad = payload => {
  return {
    type: FINISH_SINGLE_SAR_LOAD,
    payload,
  };
};

export const errorSingleSarLoad = payload => {
  return {
    type: ERROR_SINGLE_SAR_LOAD,
    payload,
  };
};
