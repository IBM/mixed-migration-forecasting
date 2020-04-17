import {
  INIT_FILTERED_DATA_LOAD,
  START_FILTERED_DATA_LOAD,
  FINISH_FILTERED_DATA_LOAD,
  ERROR_FILTERED_DATA_LOAD,
  INIT_CHART_LOAD,
  START_CHART_LOAD,
  INIT_MAP_LOAD,
  START_MAP_LOAD,
} from '../actionTypes';

export const initMapData = payload => {
  return {
    type: INIT_MAP_LOAD,
    payload,
  };
};
export const startMapData = payload => {
  return {
    type: START_MAP_LOAD,
    payload,
  };
};

export const initChartData = payload => {
  return {
    type: INIT_CHART_LOAD,
    payload,
  };
};

export const startChartData = payload => {
  return {
    type: START_CHART_LOAD,
    payload,
  };
};

export const initFilteredDataLoad = payload => {
  return {
    type: INIT_FILTERED_DATA_LOAD,
    payload,
  };
};
export const startFilteredDataLoad = payload => {
  return {
    type: START_FILTERED_DATA_LOAD,
    payload,
  };
};

export const finishFilteredDataLoad = payload => {
  return {
    type: FINISH_FILTERED_DATA_LOAD,
    payload,
  };
};

export const errorFilteredDataLoad = payload => {
  return {
    type: ERROR_FILTERED_DATA_LOAD,
    payload,
  };
};
