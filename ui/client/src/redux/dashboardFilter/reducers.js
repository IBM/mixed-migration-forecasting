import * as actionTypes from '../actionTypes';
import { stateUpdater } from '../stateUpdater';

const initialState = {
  isLoading: true,
  isError: false,
  errorMessage: '',
  categories: {},
  selectedCategories: { Country: ['AFG'] },
};
const startCategoriesLoad = state => {
  return stateUpdater(state, {
    isLoading: true,
  });
};

const finishCategoriesLoad = (state, action) => {
  return stateUpdater(state, {
    isLoading: false,
    isError: false,
    errorMessage: '',
    categories: action.payload,
  });
};

const errorCategoriesLoad = (state, action) => {
  return stateUpdater(state, {
    isLoading: false,
    isError: true,
    errorMessage: action.payload.errorMessage,
  });
};

const selectCategories = (state, action) => {
  return stateUpdater(state, {});
};

const submitSelectedCategories = (state, action) => {
  return stateUpdater(state, {
    selectedCategories: action.payload,
  });
};

export const filterReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.REQUEST_MENU_FILTERS: {
      return startCategoriesLoad(state);
    }
    case actionTypes.RECEIVE_MENU_FILTERS: {
      return finishCategoriesLoad(state, action);
    }
    case actionTypes.ERROR_MENU_FILTERS: {
      return errorCategoriesLoad(state, action);
    }
    case actionTypes.SELECT_MENU_FILTERS: {
      return selectCategories(state, action);
    }
    case actionTypes.SUBMIT_MENU_FILTERS: {
      return submitSelectedCategories(state, action);
    }
    default:
      return state;
  }
};
