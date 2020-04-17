import {
  START_CAUSALITY_DEMO_LOAD,
  FINISH_CAUSALITY_DEMO_LOAD,
  ERROR_CAUSALITY_DEMO_LOAD,
  FINISH_CAUSALITY_META_LOAD,
  UPDATE_CAUSALITY_MARGINALS,
  FINISH_CAUSALITY_LOAD,
  CAUSALITY_CLEAN_SELECTION,
  CAUSALITY_DIMENSION_CLICKED,
} from '../actionTypes';
import { stateUpdater } from '../stateUpdater';
import update from 'immutability-helper';

const initialState = {
  isLoading: false,
  isError: false,
  errorMessage: '',
  demos: {},
  meta: {
    date: 2019,
  },
  marginals: {
    selection: {},
  },
};
const startCausalityDemoLoad = state => {
  return stateUpdater(state, {
    isLoading: true,
  });
};

const finishCausalityDemoLoad = (state, action) => {
  return stateUpdater(state, {
    isError: false,
    errorMessage: '',
    demos: {
      list: action.payload.response.demos,
      current: action.payload.current,
      running: [],
    },
  });
};

const finishCausalityMetaLoad = (state, action) => {
  return update(state, {
    isError: { $set: false },
    errorMessage: { $set: '' },
    meta: {
      $set: {
        availableDimensions: action.payload.availableDimensions,
        missingDimensions: action.payload.missingDimensions,
        delay: action.payload.delay,
        categories: action.payload.categories,
        network: action.payload.network,
      },
    },
  });
};

const clickCausalityDimension = (state, action) => {
  const parameterId = action.payload.parameterId;
  const dimensionId = action.payload.dimension.id;
  const currentValue = state.marginals.selection
    ? state.marginals.selection[dimensionId]
    : undefined;

  // Switch on/off logic
  const nextValue =
    currentValue && currentValue === parameterId ? undefined : parameterId;

  return update(state, {
    marginals: { selection: { [dimensionId]: { $set: nextValue } } },
  });
};

const updateCausalityMarginals = (state, action) => {
  return stateUpdater(state, {
    isError: false,
    errorMessage: '',
    marginals: {
      computed: action.payload.marginals,
      selection: state.marginals
        ? state.marginals.selection
        : action.payload.selection,
      population: action.payload.population.partial,
      totalPopulation: action.payload.population.total,
      interventions: action.payload.interventions,
    },
  });
};

const clearSelectedCausalityMarginals = (state, action) => {
  return stateUpdater(state, {
    marginals: { selection: { $set: {} } },
  });
};

const fiinishCausalityLoad = (state, action) => {
  return stateUpdater(state, {
    isLoading: false,
    isError: false,
    errorMessage: '',
  });
};

const errorCausalityDemoLoad = (state, action) => {
  return stateUpdater(state, {
    isLoading: false,
    isError: true,
    errorMessage: action.payload.errorMessage,
  });
};

export const causalityDemoReducer = (state = initialState, action) => {
  switch (action.type) {
    case START_CAUSALITY_DEMO_LOAD: {
      return startCausalityDemoLoad(state);
    }
    case FINISH_CAUSALITY_DEMO_LOAD: {
      return finishCausalityDemoLoad(state, action);
    }
    case FINISH_CAUSALITY_META_LOAD: {
      return finishCausalityMetaLoad(state, action);
    }
    case UPDATE_CAUSALITY_MARGINALS: {
      return updateCausalityMarginals(state, action);
    }
    case CAUSALITY_DIMENSION_CLICKED: {
      return clickCausalityDimension(state, action);
    }
    case CAUSALITY_CLEAN_SELECTION: {
      return clearSelectedCausalityMarginals(state, action);
    }
    case FINISH_CAUSALITY_LOAD: {
      return fiinishCausalityLoad(state, action);
    }
    case ERROR_CAUSALITY_DEMO_LOAD: {
      return errorCausalityDemoLoad(state, action);
    }
    default:
      return state;
  }
};
