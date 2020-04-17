import {
  START_COUNTRY_GENERIC_DATA_LOAD,
  FINISH_COUNTRY_GENERIC_DATA_LOAD,
  ERROR_COUNTRY_GENERIC_DATA_LOAD,
} from '../actionTypes';
import { stateUpdater } from '../stateUpdater';

const initialState = {
  isLoading: true,
  isError: false,
  errorMessage: '',
  countryGenData: [],
};
const startCountryGenDataLoad = state => {
  return stateUpdater(state, {
    isLoading: true,
  });
};

const finishCountryGenDataLoad = (state, action) => {
  return stateUpdater(state, {
    isLoading: false,
    isError: false,
    errorMessage: '',
    countryGenData: action.payload,
  });
};

const errorCountryGenDataLoad = (state, action) => {
  return stateUpdater(state, {
    isLoading: false,
    isError: true,
    errorMessage: action.payload.errorMessage,
  });
};

export const genericCountryDataReducer = (state = initialState, action) => {
  switch (action.type) {
    case START_COUNTRY_GENERIC_DATA_LOAD: {
      return startCountryGenDataLoad(state);
    }
    case FINISH_COUNTRY_GENERIC_DATA_LOAD: {
      return finishCountryGenDataLoad(state, action);
    }
    case ERROR_COUNTRY_GENERIC_DATA_LOAD: {
      return errorCountryGenDataLoad(state, action);
    }
    default:
      return state;
  }
};
