import axios from 'axios';
import { put, takeLatest, all, select } from 'redux-saga/effects';
import {
  INIT_CAUSALITY_DEMO_LOAD,
  SELECT_CAUSALITY_MARGINALS,
} from '../actionTypes';
import { TRAFFICKING_DATA_GET_USER_DATA_URL } from '../constRequestURLs';
import * as actions from './actions';

function* workerCausalityDemoSaga(demoId) {
  let demoList;
  let uiConfig;
  let networkData;
  let firstEmptyComputation;
  try {
    yield put(actions.startCausalityDemoLoad());
    demoList = yield axios({
      method: 'get',
      url: 'https://hwprofile-dev.eu-de.mybluemix.net/demo_list',
      headers: { 'Content-Type': 'application/json' },
    });
    yield put(
      actions.finishCausalityDemoLoad({
        response: demoList.data,
        current: demoList.data.demos[0].id,
      }),
    );
    uiConfig = yield axios({
      method: 'get',
      url: 'https://hwprofile-dev.eu-de.mybluemix.net/config',
      headers: { 'Content-Type': 'application/json' },
    });
    networkData = yield axios({
      method: 'get',
      url: `https://hwprofile-dev.eu-de.mybluemix.net/network/${demoList.data.demos[0].id}`,
      headers: { 'Content-Type': 'application/json' },
    });
    firstEmptyComputation = yield axios({
      method: 'get',
      url: `https://hwprofile-dev.eu-de.mybluemix.net/marginals/${demoList.data.demos[0].id}`,
      headers: { 'Content-Type': 'application/json' },
    });
    uiConfig = uiConfig.data;
    networkData = networkData.data;
    firstEmptyComputation = firstEmptyComputation.data;
    const allMarginals = firstEmptyComputation.marginals;
    const filteredCategories = uiConfig.categories
      .map(cat => ({
        ...cat,
        children: cat.children.filter(
          dimensionId => networkData.nodes.indexOf(dimensionId) >= 0,
        ),
      }))
      .filter(cat => cat.children.length > 0);
    const otherCategoryChildren = [];

    const availableDimensions = networkData.nodes.map(nodeId => {
      const dimensionDefinition = uiConfig.dimensions.find(
        d => d.id === nodeId,
      ) || { id: nodeId, label: nodeId, image: '' };

      // It doen't belong to any category
      if (!filteredCategories.some(cat => cat.children.indexOf(nodeId) >= 0)) {
        otherCategoryChildren.push(nodeId);
      }

      // const parametersDef: Bayesian.Parameter[] = ( dimensionDefinition && dimensionDefinition.parameters ) || [ ];

      const parametersOrder = networkData.order[nodeId];

      const findParameterPosition = parameterId => {
        return parametersOrder
          ? parametersOrder.findIndex(p => p === parameterId)
          : -1;
      };

      const parameters = Object.keys(allMarginals[nodeId])
        // .map( parameterId => parametersDef.find( p => p.id === parameterId ) || { id: parameterId, label: buildLabel(parameterId) } )
        .map(id => {
          const label =
            (dimensionDefinition.parameters &&
              dimensionDefinition.parameters[id]) ||
            id;
          const isComparable = findParameterPosition(id) >= 0;
          return { id, label, isComparable };
        })
        .sort((p1, p2) => {
          let pos1 = findParameterPosition(p1.id);
          let pos2 = findParameterPosition(p2.id);
          return pos1 !== pos2 ? pos1 - pos2 : p1.label.localeCompare(p2.label);
        });
      return {
        id: nodeId,
        label: (dimensionDefinition && dimensionDefinition.label) || nodeId,
        image: (dimensionDefinition && dimensionDefinition.image) || '',
        hasOrder: parametersOrder !== null && parametersOrder !== undefined,
        parameters: parameters,
      };
    });
    if (otherCategoryChildren.length > 0) {
      filteredCategories.push({
        label: 'Other',
        color: 'none',
        children: otherCategoryChildren,
      });
    }

    // Used to fetch labels in the calendar, minute tooltip
    const missingDimensions = uiConfig.dimensions
      .filter(d => networkData.nodes.indexOf(d.id) < 0)
      .map(d => ({
        ...d,
        hasOrder: false,
        parameters: Object.keys(d.parameters || {}).map(p => ({
          id: p,
          // If I'm here, parameters is defined
          label: d.parameters[p],
          isComparable: false,
        })),
      }));

    // Just a check that dimensions labels are declared once, to avoid confusion
    uiConfig.dimensions
      .reduce((map, dim) => {
        if (map.has(dim.id)) map.set(dim.id, map.get(dim.id) + 1);
        else map.set(dim.id, 1);
        return map;
      }, new Map())
      .forEach((count, dimId) => {
        count > 1 &&
          console.log(
            `Dimension ${dimId} has been declared multiple times (${count}) in UI configuration.`,
          );
      });
    const bootstrapData = {
      categories: filteredCategories,
      availableDimensions: availableDimensions,
      missingDimensions: missingDimensions,
      delay: uiConfig.delay,
      network: networkData,
      selectedDemoId: demoId,
      firstEmptyComputation: firstEmptyComputation,
    };
    yield put(actions.finishCausalityMetaLoad(bootstrapData));
    yield put(
      actions.updateCausalityMarginals(bootstrapData.firstEmptyComputation),
    );
    yield put(actions.fiinishCausalityLoad());
  } catch (error) {
    yield put(
      actions.errorCausalityDemoLoad({ errorMessage: 'Could not load data' }),
    );
    console.error(error);
  }
}

function* workerCausalityMarginals() {
  // selectCausalityMarginals
  try {
    const requestBody = yield select(state => {
      return {
        selection: state.causalityDemoStore.marginals.selection,
        demoId: state.causalityDemoStore.demos.current,
      };
    });
    const firstEmptyComputation = yield axios({
      method: 'post',
      url: `https://hwprofile-dev.eu-de.mybluemix.net/marginals/${requestBody.demoId}`,
      headers: { 'Content-Type': 'application/json' },
      data: requestBody.selection,
    });
    yield put(actions.updateCausalityMarginals(firstEmptyComputation.data));
  } catch (error) {
    console.error(error);
  }
}

export function* watchCausalityDemoSaga() {
  yield all([
    takeLatest(INIT_CAUSALITY_DEMO_LOAD, workerCausalityDemoSaga),
    takeLatest(SELECT_CAUSALITY_MARGINALS, workerCausalityMarginals),
  ]);
}
