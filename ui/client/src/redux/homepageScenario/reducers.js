import {
  INIT_SCENARIO_DATA_LOAD,
  START_SCENARIO_DATA_LOAD,
  FINISH_SCENARIO_DATA_LOAD,
  ERROR_SCENARIO_DATA_LOAD,
} from '../actionTypes';
import { stateUpdater } from '../stateUpdater';

const initialState = {
  isLoading: true,
  isError: false,
  errorMessage: '',
  scenarioData: {
    labels: [],
    clusters: [],
  },
};

const startScenarioDataLoad = state => {
  return stateUpdater(state, {
    isLoading: true,
  });
};

const finishScenarioDataLoad = (state, action) => {
  return stateUpdater(state, {
    isLoading: false,
    isError: false,
    errorMessage: '',
    scenarioData: action.payload,
  });
};

const errorScenarioDataLoad = (state, action) => {
  return stateUpdater(state, {
    isLoading: false,
    isError: true,
    errorMessage: action.payload.errorMessage,
  });
};

export const homepageScenarioReducer = (state = initialState, action) => {
  switch (action.type) {
    case START_SCENARIO_DATA_LOAD: {
      return startScenarioDataLoad(state);
    }
    case FINISH_SCENARIO_DATA_LOAD: {
      return finishScenarioDataLoad(state, action);
    }
    case ERROR_SCENARIO_DATA_LOAD: {
      return errorScenarioDataLoad(state, action);
    }
    default:
      return state;
  }
};
