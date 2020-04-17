import {
  INIT_MAP_DATA_LOAD,
  START_MAP_DATA_LOAD,
  FINISH_MAP_DATA_LOAD,
  ERROR_MAP_DATA_LOAD,
} from '../actionTypes';

export const initMapDataLoad = payload => {
  return {
    type: INIT_MAP_DATA_LOAD,
    payload,
  };
};

export const startMapDataLoad = payload => {
  return {
    type: START_MAP_DATA_LOAD,
    payload,
  };
};

export const finishMapDataLoad = payload => {
  return {
    type: FINISH_MAP_DATA_LOAD,
    payload,
  };
};

export const errorMapDataLoad = payload => {
  return {
    type: ERROR_MAP_DATA_LOAD,
    payload,
  };
};
