import {
  INIT_INDICATORS_LOAD,
  START_INDICATORS_LOAD,
  FINISH_INDICATORS_LOAD,
  ERROR_INDICATORS_LOAD,
} from '../actionTypes';

export const initIndicatorsLoad = payload => {
  return {
    type: INIT_INDICATORS_LOAD,
    payload,
  };
};
export const startIndicatorsLoad = payload => {
  return {
    type: START_INDICATORS_LOAD,
    payload,
  };
};
export const finishIndicatorsLoad = payload => {
  return {
    type: FINISH_INDICATORS_LOAD,
    payload,
  };
};
export const errorIndicatorsLoad = payload => {
  return {
    type: ERROR_INDICATORS_LOAD,
    payload,
  };
};
