import {
  INIT_USER_DATA_LOAD,
  START_USER_DATA_LOAD,
  FINISH_USER_DATA_LOAD,
  ERROR_USER_DATA_LOAD,
} from '../actionTypes';

export const initUserDataLoad = payload => {
  return {
    type: INIT_USER_DATA_LOAD,
    payload,
  };
};

export const startUserDataLoad = payload => {
  return {
    type: START_USER_DATA_LOAD,
    payload,
  };
};

export const finishUserDataLoad = payload => {
  return {
    type: FINISH_USER_DATA_LOAD,
    payload,
  };
};

export const errorUserDataLoad = payload => {
  return {
    type: ERROR_USER_DATA_LOAD,
    payload,
  };
};
