import {
  INIT_MENU_FILTERS,
  REQUEST_MENU_FILTERS,
  RECEIVE_MENU_FILTERS,
  ERROR_MENU_FILTERS,
  SELECT_MENU_FILTERS,
  SUBMIT_MENU_FILTERS,
} from '../actionTypes';

export const initCategoriesLoad = payload => {
  return {
    type: INIT_MENU_FILTERS,
    payload,
  };
};

export const startCategoriesLoad = payload => {
  return {
    type: REQUEST_MENU_FILTERS,
    payload,
  };
};

export const finishCategoriesLoad = payload => {
  return {
    type: RECEIVE_MENU_FILTERS,
    payload,
  };
};

export const errorCategoriesLoad = payload => {
  return {
    type: ERROR_MENU_FILTERS,
    payload,
  };
};

export const selectCategories = payload => {
  return {
    type: SELECT_MENU_FILTERS,
    payload,
  };
};

export const submitSelectedCategories = payload => {
  return {
    type: SUBMIT_MENU_FILTERS,
    payload,
  };
};
