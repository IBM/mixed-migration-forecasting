import {
  INIT_USER_ACTION,
  START_USER_ACTION_EDIT,
  ERROR_USER_ACTION,
} from '../actionTypes';

export const initUserAction = payload => {
  return {
    type: INIT_USER_ACTION,
    payload,
  };
};

export const startUserAction = payload => {
  return {
    type: START_USER_ACTION_EDIT,
    payload,
  };
};

export const errorUserAction = payload => {
  return {
    type: ERROR_USER_ACTION,
    payload,
  };
};
