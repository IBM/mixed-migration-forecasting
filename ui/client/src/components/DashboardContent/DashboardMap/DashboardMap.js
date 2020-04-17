//Base imports
import React from 'react';
import { connect } from 'react-redux';

import * as i18nIsoCountries from 'i18n-iso-countries';

//Material Ui components
import LinearProgress from '@material-ui/core/LinearProgress';

//Custom components
import Title from '../../common/typography/Title/Title';
import { selectCategories } from '../../../redux/dashboardFilter/actions';
// import { initFilteredDataLoad } from '../../../redux/dashboardContent/actions';
import { initCountryGenDataLoad } from './../../../redux/genericCountryData/actions';
import DashboardMapLegend from './DashboardMapLegend/DashboardMapLegend';

// const incorrectCountries = ['Czechia', 'Macedonia', 'Moldova', 'United States'];
// const incorrectCountriesCodes = ['CZE', 'MKD', 'MDA', 'USA'];
const DahsboardMap = props => {
  const { data = [] } = props;
  let mapData = {
    type: 'choropleth',
  };
  let reqData = {
    title: 'Unknown',
    year: 2019,
    data: {},
  };
  if (data.filterData.mapData) {
    reqData.title = Object.keys(data.filterData.mapData)[0] || 'N/A';
    reqData.year =
      Object.keys(
        data.filterData.mapData[Object.keys(data.filterData.mapData)[0]].data,
      )[0] || 'N/A';
    reqData.data =
      data.filterData.mapData[Object.keys(data.filterData.mapData)[0]].data[
        Object.keys(
          data.filterData.mapData[Object.keys(data.filterData.mapData)[0]].data,
        )[0]
      ] || {};
    const locations = [];
    const values = [];
    Object.keys(reqData.data).forEach(el => {
      locations.push(el);
      values.push(reqData.data[el]);
    });
    mapData.locations = locations;
    mapData.z = values;
    mapData.colorscale = [
      ['0', 'rgb(165, 25, 32'],
      ['1', 'rgb(61, 153, 86)'],
    ];
    mapData.reversescale = true;
  }
  i18nIsoCountries.registerLocale(require('i18n-iso-countries/langs/en.json'));

  const handleCountryClick = countryName => {
    props.passSelectedCategories({
      Country: [i18nIsoCountries.getAlpha3Code(countryName, 'en')],
    });
    props.requestGenericCountryData({ countryName });
  };
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Title
        style={{ padding: '24px' }}
      >{`${reqData.title} for ${reqData.year} year`}</Title>
      {data.isLoading ? <LinearProgress /> : <div style={{ height: '4px' }} />}
      <DashboardMapLegend />
      {/* <Plot
        config={{
          scrollZoom: false,
          responsive: true,
        }}
        data={[mapData]}
        layout={{
          dragmode: false,
          showlegend: true,
          showframe: false,
          margin: {
            l: 0,
            r: 0,
            b: 0,
            t: 0,
            pad: 0,
          },
          geo: {
            showframe: false,
            showcoastlines: false,
            landcolor: 'lightgray',
            showland: true,
            showcountries: true,
            countrycolor: 'gray',
            countrywidth: 0.5,
          },
          legend: {
            traceorder: 'normal',
            font: {
              family: 'sans-serif',
              size: 12,
              color: '#000',
            },
            bgcolor: '#000',
            bordercolor: '#000000',
            borderwidth: 2,
          },
        }}
        onClick={data => {
          console.log(data.points[0].location);
          handleCountryClick(data.points[0].location);
        }}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler
      /> */}
    </div>
  );
};

const mapStateToProps = state => ({
  pieIndicator: state.dashboardContentStore.filterOptions.pieIndicator,
  lineIndicator: state.dashboardContentStore.filterOptions.lineIndicator,
});

const mapDispatchToProps = dispatch => {
  return {
    passSelectedCategories: selectedCategories =>
      dispatch(selectCategories(selectedCategories)),
    requestGenericCountryData: countryCode =>
      dispatch(initCountryGenDataLoad(countryCode)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DahsboardMap);
