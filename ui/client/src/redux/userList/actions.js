import {
  INIT_USER_LIST_DATA_LOAD,
  START_USER_LIST_DATA_LOAD,
  FINISH_USER_LIST_DATA_LOAD,
  ERROR_USER_LIST_DATA_LOAD,
} from '../actionTypes';

export const initUserListDataLoad = payload => {
  return {
    type: INIT_USER_LIST_DATA_LOAD,
    payload,
  };
};

export const startUserListDataLoad = payload => {
  return {
    type: START_USER_LIST_DATA_LOAD,
    payload,
  };
};

export const finishUserListDataLoad = payload => {
  return {
    type: FINISH_USER_LIST_DATA_LOAD,
    payload,
  };
};

export const errorUserListDataLoad = payload => {
  return {
    type: ERROR_USER_LIST_DATA_LOAD,
    payload,
  };
};
