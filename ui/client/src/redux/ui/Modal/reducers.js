import { INIT_MODAL, SHOW_MODAL, HIDE_MODAL } from '../../actionTypes';

const initialState = {
  isVisible: false,
};

const initModal = (state, action) => {
  return {
    ...action.payload,
  };
};

const showModal = (state, action) => {
  return {
    ...action.payload,
    isVisible: true,
    type: action.payload.type,
    data: action.payload.data,
  };
};

const hideModal = state => {
  return {
    ...state,
    isVisible: false,
  };
};

export const modalReducer = (state = initialState, action) => {
  switch (action.type) {
    case INIT_MODAL:
      return initModal(state, action);
    case SHOW_MODAL:
      return showModal(state, action);
    case HIDE_MODAL:
      return hideModal(state, action);
    default:
      return state;
  }
};
