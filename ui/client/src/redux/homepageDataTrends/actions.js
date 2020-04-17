import {
  INIT_DATA_TRENDS_LOAD,
  START_DATA_TRENDS_LOAD,
  FINISH_DATA_TRENDS_LOAD,
  ERROR_DATA_TRENDS_LOAD,
  INIT_DATA_TRENDS_META_LOAD,
  START_DATA_TRENDS_META_LOAD,
  FINISH_DATA_TRENDS_META_LOAD,
  ERROR_DATA_TRENDS_META_LOAD,
} from '../actionTypes';

export const initDataTrendsLoad = payload => {
  return {
    type: INIT_DATA_TRENDS_LOAD,
    payload,
  };
};

export const startDataTrendsLoad = payload => {
  return {
    type: START_DATA_TRENDS_LOAD,
    payload,
  };
};

export const finishDataTrendsLoad = payload => {
  return {
    type: FINISH_DATA_TRENDS_LOAD,
    payload,
  };
};

export const errorDataTrendsLoad = payload => {
  return {
    type: ERROR_DATA_TRENDS_LOAD,
    payload,
  };
};

export const initDataTrendsMetaLoad = payload => {
  return {
    type: INIT_DATA_TRENDS_META_LOAD,
    payload,
  };
};

export const startDataTrendsMetaLoad = payload => {
  return {
    type: START_DATA_TRENDS_META_LOAD,
    payload,
  };
};

export const finishDataTrendsMetaLoad = payload => {
  return {
    type: FINISH_DATA_TRENDS_META_LOAD,
    payload,
  };
};

export const errorDataTrendsMetaLoad = payload => {
  return {
    type: ERROR_DATA_TRENDS_META_LOAD,
    payload,
  };
};
