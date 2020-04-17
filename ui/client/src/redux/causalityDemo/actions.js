import {
  INIT_CAUSALITY_DEMO_LOAD,
  START_CAUSALITY_DEMO_LOAD,
  FINISH_CAUSALITY_DEMO_LOAD,
  ERROR_CAUSALITY_DEMO_LOAD,
  FINISH_CAUSALITY_META_LOAD,
  UPDATE_CAUSALITY_MARGINALS,
  FINISH_CAUSALITY_LOAD,
  CAUSALITY_DIMENSION_CLICKED,
  SELECT_CAUSALITY_MARGINALS,
  CAUSALITY_CLEAN_SELECTION,
} from '../actionTypes';

export const initCausalityDemoLoad = payload => {
  return {
    type: INIT_CAUSALITY_DEMO_LOAD,
    payload,
  };
};
export const startCausalityDemoLoad = payload => {
  return {
    type: START_CAUSALITY_DEMO_LOAD,
    payload,
  };
};
export const finishCausalityDemoLoad = payload => {
  return {
    type: FINISH_CAUSALITY_DEMO_LOAD,
    payload,
  };
};
export const finishCausalityMetaLoad = payload => {
  return {
    type: FINISH_CAUSALITY_META_LOAD,
    payload,
  };
};
export const updateCausalityMarginals = payload => {
  return {
    type: UPDATE_CAUSALITY_MARGINALS,
    payload,
  };
};
export const clickCausalityDimension = payload => {
  return {
    type: CAUSALITY_DIMENSION_CLICKED,
    payload,
  };
};
export const clearSelectedCausalityMarginals = payload => {
  return {
    type: CAUSALITY_CLEAN_SELECTION,
    payload,
  };
};
export const selectCausalityMarginals = payload => {
  return {
    type: SELECT_CAUSALITY_MARGINALS,
    payload,
  };
};
export const fiinishCausalityLoad = payload => {
  return {
    type: FINISH_CAUSALITY_LOAD,
    payload,
  };
};
export const errorCausalityDemoLoad = payload => {
  return {
    type: ERROR_CAUSALITY_DEMO_LOAD,
    payload,
  };
};
