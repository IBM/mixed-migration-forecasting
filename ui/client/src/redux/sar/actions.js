import {
  INIT_SAR_LOAD,
  START_SAR_LOAD,
  FINISH_SAR_LOAD,
  ERROR_SAR_LOAD,
  SAVE_SAR_IMAGE,
} from '../actionTypes';

export const initSarLoad = payload => {
  return {
    type: INIT_SAR_LOAD,
    payload,
  };
};

export const startSarLoad = payload => {
  return {
    type: START_SAR_LOAD,
    payload,
  };
};

export const finishSarLoad = payload => {
  return {
    type: FINISH_SAR_LOAD,
    payload,
  };
};

export const errorSarLoad = payload => {
  return {
    type: ERROR_SAR_LOAD,
    payload,
  };
};

export const saveSarImage = payload => {
  return {
    type: SAVE_SAR_IMAGE,
    payload,
  };
};
