/* eslint-disable react/display-name */
import React, { useEffect } from 'react';
import { useRoutes, useRedirect, navigate } from 'hookrouter';
import { connect } from 'react-redux';
import { CookiesProvider } from 'react-cookie';
import { useCookies } from 'react-cookie';

import { ThemeProvider } from '@material-ui/styles';

import { initUserDataLoad } from './redux/account/actions';
import PageHeader from './components/Layout/PageHeader/PageHeader';
import PageContent from './components/Layout/PageContent/PageContent';
import Modal from './components/common/Modal/Modal';

//Pages
import AnalysisRegisters from './pages/AnalysisRegister/AnalysisRegisters';
import AnalysisRegister from './pages/AnalysisRegister/AnalysisRegister';
import AnalysisReport from './pages/AnalysisReport/index';
import Map from './pages/Map/';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home/';
import Profile from './pages/Profile/';
import CausalityModel from './pages/CausalityModel';
import PageNotFound from './pages/PageNotFound';

//styles
import './styles/main.scss';
import theme from './App.theme';

const routes = {
  '/dashboard': () => <Dashboard />,
  '/map': () => <Map />,
  '/home': () => <Home />,
  '/profile': () => <Profile />,
  '/analysis-register': () => <AnalysisRegisters />,
  '/analysis-register/:id': () => <AnalysisRegister />,
  '/analysis-report': () => <AnalysisReport />,
  '/causality-model': () => <CausalityModel />,
};

const App = props => {
  const [userEmailCookie] = useCookies('user');
  useEffect(() => {
    props.initUserDataLoad({
      userData: {
        email: userEmailCookie['user'] || null,
        password: userEmailCookie['password'] || null,
      },
    });
  }, []);
  useRedirect('/', '/home');
  const routeResult = useRoutes(routes);
  return (
    <CookiesProvider>
      <ThemeProvider theme={theme}>
        <PageHeader user={props.user.userData} />
        <PageContent>
          {routeResult ? routeResult : <PageNotFound />}
        </PageContent>
        <Modal />
      </ThemeProvider>
    </CookiesProvider>
  );
};

const mapStateToProps = state => ({
  user: state.userDataStore,
});
const mapDispatchToProps = dispatch => ({
  initUserDataLoad: data => dispatch(initUserDataLoad(data)),
});
export default connect(mapStateToProps, mapDispatchToProps)(App);
