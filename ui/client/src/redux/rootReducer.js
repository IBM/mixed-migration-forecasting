import { combineReducers } from 'redux';
import { dashboardContentReducer } from './dashboardContent/reducers';
import { filterReducer } from './dashboardFilter/reducers';
import { mapDataReducer } from './mapContent/reducers';
import { userDataReducer } from './account/reducers';
import { genericCountryDataReducer } from './genericCountryData/reducers';
import { userListDataReducer } from './userList/reducers';
import { modalReducer } from './ui/Modal/reducers';
import { homepageContentReducer } from './homepageForecast/reducers';
import { homepagDataTrendsReducer } from './homepageDataTrends/reducers';
import { homepageScenarioReducer } from './homepageScenario/reducers';
import { sarReducer } from './sar/reducers';
import { singleSarReducer } from './sarSinglePage/reducers';
import { indicatorsReducer } from './allIndicators/reducers';
import { causalityDemoReducer } from './causalityDemo/reducers';

const rootReducer = combineReducers({
  dashboardContentStore: dashboardContentReducer,
  filterStore: filterReducer,
  mapStore: mapDataReducer,
  userDataStore: userDataReducer,
  genericCountryDataStore: genericCountryDataReducer,
  userListStore: userListDataReducer,
  modalStore: modalReducer,
  homepageForecastStore: homepageContentReducer,
  homepageDataTrendsStore: homepagDataTrendsReducer,
  homepageScenarioDataStore: homepageScenarioReducer,
  sarStore: sarReducer,
  singleSarStore: singleSarReducer,
  indicatorsStore: indicatorsReducer,
  causalityDemoStore: causalityDemoReducer,
  // Add your reducer here
});

export default rootReducer;
