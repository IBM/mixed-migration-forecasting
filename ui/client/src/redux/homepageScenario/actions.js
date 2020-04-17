import {
  INIT_SCENARIO_DATA_LOAD,
  START_SCENARIO_DATA_LOAD,
  FINISH_SCENARIO_DATA_LOAD,
  ERROR_SCENARIO_DATA_LOAD,
} from '../actionTypes';

export const initScenarioDataLoad = payload => {
  return {
    type: INIT_SCENARIO_DATA_LOAD,
    payload,
  };
};

export const startScenarioDataLoad = payload => {
  return {
    type: START_SCENARIO_DATA_LOAD,
    payload,
  };
};

export const finishScenarioDataLoad = payload => {
  return {
    type: FINISH_SCENARIO_DATA_LOAD,
    payload,
  };
};

export const errorScenarioDataLoad = payload => {
  return {
    type: ERROR_SCENARIO_DATA_LOAD,
    payload,
  };
};
