//Base imports
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import clsx from 'clsx';

//Material UI components
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import Toolbar from '@material-ui/core/Toolbar';
import Grid from '@material-ui/core/Grid';

//Custom components
import { ChipMultiSelector } from '../common';

//Redux
import { initCategoriesLoad } from '../../redux/dashboardFilter/actions';
import { initFilteredDataLoad } from '../../redux/dashboardContent/actions';

//Page styling theme
import dashboardTheme from '../../pages/Dashboard/Dashboard.theme';

const useStyles = makeStyles(dashboardTheme);

const DashboardFilter = props => {
  const {
    years,
    countries,
    genders,
    trafficingTypes,
    isLoading,
    selectedCategories,
  } = props;
  const classes = useStyles();
  const [tempYears, setTempYears] = useState([]);
  const [tempCountries, setTempCountries] = useState([]);
  const [tempGenders, setTempGenders] = useState([]);
  const [tempTrafficingTypes, setTempTrafficingTypes] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedGenders, setSelectedGenders] = useState([]);
  const [selectedTrafficingTypes, setSelectedTrafficingTypes] = useState([]);
  const [currentSelect, setCurrentSelect] = React.useState('');

  const setFilterSelect = (handler, value) => {
    handler(value);
  };

  useEffect(() => {
    props.initCategoriesLoading();
  }, []);

  useEffect(() => {
    currentSelect !== 'Country' && setTempCountries(countries);
    currentSelect !== 'Year' && setTempYears(years);
    currentSelect !== 'Victim Gender' && setTempGenders(genders);
    currentSelect !== 'Trafficking Type' &&
      setTempTrafficingTypes(trafficingTypes);
  }, [countries, years, genders, trafficingTypes]);

  useEffect(() => {
    if (selectedCategories['Country']) {
      setSelectedCountries(selectedCategories['Country']);
      filterDataRequest(
        {
          requestedCategories: [
            'Incident Report Year',
            'Country',
            'Victim Gender',
            'Trafficking Type',
          ],
          filterOptions: {
            Country: selectedCategories['Country'],
            'Victim Gender': selectedGenders,
            'Incident Report Year': selectedYears,
            'Trafficking Type': selectedTrafficingTypes,
          },
        },
        'Country',
      );
    }
  }, [selectedCategories]);

  const dashboardDataRequest = () => {
    props.initFilteredDataLoad({
      'Incident Report Year': selectedYears,
      Country: selectedCountries,
      'Victim Gender': selectedGenders,
      'Trafficking Type': selectedTrafficingTypes,
    });
  };

  const actualArray = (selectedItems, responseItems) => {
    if (selectedItems.length === responseItems.length) {
      return selectedItems;
    }
    const actualArray = selectedItems.filter(element =>
      responseItems.some(el => el === element),
    );
    return actualArray;
  };

  const getFilteredDataForSelect = arr => {
    const filteredArray = arr.map(element =>
      element === '' ? 'Not Provided' : element,
    );
    return filteredArray;
  };

  const filterDataRequest = (data, currentSelect) => {
    setCurrentSelect(currentSelect);
    props.initCategoriesLoading(data);
  };

  return (
    <React.Fragment>
      {isLoading ? <LinearProgress /> : null}
      <Toolbar className={classes.toolbar}>
        <Grid container>
          <Grid item lg={5} md={5} xs={12}>
            <ChipMultiSelector
              changedSelect={setSelectedYears}
              filterDataRequest={filterDataRequest}
              handleChange={setFilterSelect}
              items={tempYears.length && getFilteredDataForSelect(tempYears)}
              requestParam="Incident Report Year"
              selectedItem={actualArray(
                selectedYears,
                tempYears,
                setSelectedYears,
              )}
              title={'Year'}
            />
          </Grid>
          <Grid item lg={6} md={6} xs={12}>
            <ChipMultiSelector
              changedSelect={setSelectedCountries}
              filterDataRequest={filterDataRequest}
              handleChange={setFilterSelect}
              items={
                tempCountries.length && getFilteredDataForSelect(tempCountries)
              }
              requestParam="Country"
              selectedItem={actualArray(
                selectedCountries,
                tempCountries,
                setSelectedCountries,
              )}
              title={'Country'}
            />
          </Grid>
          {/* <Grid item lg={3} md={3} xs={12}>
            <ChipMultiSelector
              changedSelect={setSelectedTrafficingTypes}
              filterDataRequest={filterDataRequest}
              handleChange={setFilterSelect}
              items={
                tempTrafficingTypes.length &&
                getFilteredDataForSelect(tempTrafficingTypes)
              }
              requestParam="Trafficking Type"
              selectedItem={actualArray(
                selectedTrafficingTypes,
                tempTrafficingTypes,
                setSelectedTrafficingTypes,
              )}
              title={'Trafficking Type'}
            />
          </Grid>
          <Grid item lg={3} md={3} xs={8}>
            <ChipMultiSelector
              changedSelect={setSelectedGenders}
              filterDataRequest={filterDataRequest}
              handleChange={setFilterSelect}
              items={
                tempGenders.length && getFilteredDataForSelect(tempGenders)
              }
              requestParam="Victim Gender"
              selectedItem={actualArray(
                selectedGenders,
                tempGenders,
                setSelectedGenders,
              )}
              title={'Victim Gender'}
            />
          </Grid> */}
          <Grid
            className={classes.filterApplyBtnContainer}
            item
            lg={1}
            md={1}
            xs={4}
          >
            <Button
              className={clsx(classes.filterApplyBtn, classes.link)}
              color="primary"
              href="#"
              onClick={dashboardDataRequest}
              variant="contained"
            >
              Apply
            </Button>
          </Grid>
        </Grid>
      </Toolbar>
    </React.Fragment>
  );
};

const mapStateToProps = state => {
  return {
    isLoading: state.filterStore.isLoading,
    years: state.filterStore.categories['Incident Report Year'] || [],
    countries: state.filterStore.categories['Country'] || [],
    genders: state.filterStore.categories['Victim Gender'] || [],
    trafficingTypes: state.filterStore.categories['Trafficking Type'] || [],
    selectedCategories: state.filterStore.selectedCategories,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    initCategoriesLoading: data => dispatch(initCategoriesLoad(data)),
    initFilteredDataLoad: requestBody =>
      dispatch(initFilteredDataLoad(requestBody)),
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(DashboardFilter);
