import { INIT_MODAL, SHOW_MODAL, HIDE_MODAL } from '../../actionTypes';

export const initModal = payload => {
  return {
    type: INIT_MODAL,
    payload,
  };
};

export const showModal = payload => {
  return {
    type: SHOW_MODAL,
    payload,
  };
};

export const hideModal = payload => {
  return {
    type: HIDE_MODAL,
    payload,
  };
};
