import React, { useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import d3 from 'd3';
import Datamaps from 'datamaps';
import * as i18nIsoCountries from 'i18n-iso-countries';
import numeral from 'numeral';

//Custom components
import Title from '../common/typography/Title/Title';
// import { selectCategories } from '../../../redux/dashboardFilter/actions';
import { initCountryGenDataLoad } from './../../redux/genericCountryData/actions';
import { selectCategories } from '../../redux/dashboardFilter/actions';
import DashboardMapLegend from '../DashboardContent/DashboardMap/DashboardMapLegend/DashboardMapLegend';

const DahsboardMap = props => {
  i18nIsoCountries.registerLocale(require('i18n-iso-countries/langs/en.json'));
  let mainMap = undefined;
  let onlyValues, minValue, maxValue, paletteScale;
  const MainMapEl = useRef(null);
  const [valuesForScale, setValuesForScale] = React.useState({
    maxValue: 0,
    minValue: 0,
    averageValue: 0,
  });
  const reqData = {};
  const resizeMap = () => {
    if (mainMap) {
      mainMap.resize();
    }
  };
  if (props.dashboardMapData) {
    reqData.title = Object.keys(props.dashboardMapData)[0] || 'N/A';
    reqData.year =
      Object.keys(
        props.dashboardMapData[Object.keys(props.dashboardMapData)[0]].data,
      )[0] || 'N/A';
    reqData.data =
      props.dashboardMapData[Object.keys(props.dashboardMapData)[0]].data[
        Object.keys(
          props.dashboardMapData[Object.keys(props.dashboardMapData)[0]].data,
        )[0]
      ] || {};
  }
  useEffect(() => {
    let dataset = {};
    const { isLoading } = props.data;

    if (props.responsive) {
      window.addEventListener('resize', resizeMap);
    }

    if (!isLoading && Object.keys(reqData.data).length) {
      onlyValues = Object.keys(reqData.data).map(item => {
        return reqData.data[item];
      });
      minValue = Math.min(...onlyValues);
      maxValue = Math.max(...onlyValues);
      setValuesForScale({
        maxValue,
        minValue,
        averageValue: (Math.floor(maxValue + minValue) / 2).toFixed(0),
      });

      paletteScale = d3.scale
        .linear()
        .domain([minValue, maxValue])
        .range(['#03a1fc', '#fca903']);

      Object.keys(reqData.data).forEach(item => {
        const value = reqData.data[item];
        dataset[item] = {
          counter: value,
          fillColor:
            props.selectedCountry === item
              ? '#b45cbf'
              : value > 0
              ? paletteScale(value)
              : '#478fb3',
        };
      });
    }
    clear();
    drawMap(dataset);
  }, [props.data, props.selectedCountry]);

  const popupTemplateBlock = (geo, data) => {
    return `<div class='hoverinfo'><strong>${geo}</strong>${
      data ? `<br>Count: <strong>${data}</strong></div>` : ''
    }`;
  };

  const clear = () => {
    const { current } = MainMapEl;
    for (const child of Array.from(current.childNodes)) {
      current.removeChild(child);
    }
  };

  const handleCountryClick = countryCode => {
    props.passSelectedCategories({
      Country: [countryCode],
    });
    props.requestGenericCountryData({ countryCode: countryCode });
  };

  const drawMap = data => {
    if (!mainMap) {
      mainMap = new Datamaps({
        ...props,
        data,
        element: MainMapEl.current,
        fills: {
          defaultFill: '#999999',
        },
        geographyConfig: {
          highlightOnHover: true,
          highlightFillColor: '#6985b3',
          highlightBorderColor: '',
          popupTemplate: (geo, data) => {
            return popupTemplateBlock(geo.properties.name, data.counter);
          },
        },
        done: datamap => {
          datamap.svg.selectAll('.datamaps-subunit').on('click', geography => {
            handleCountryClick(geography.id);
          });
        },
      });
    }
  };
  return (
    <React.Fragment>
      <Title>{reqData.title}</Title>
      <DashboardMapLegend />
      <div ref={MainMapEl} style={{ width: '100%', height: '100%' }} />
      <div
        style={{
          height: '30px',
          background:
            'linear-gradient(45deg, rgb(3, 161, 252), rgb(252, 169, 3))',
        }}
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '11px',
          color: 'darkgrey',
        }}
      >
        <span>{numeral(valuesForScale.minValue).format('0.0[0]a') || ''}</span>
        <span>
          {numeral(valuesForScale.averageValue).format('0.0[0]a') || ''}
        </span>
        <span>{numeral(valuesForScale.maxValue).format('0.0[0]a') || ''}</span>
      </div>
    </React.Fragment>
  );
};

const mapStateToProps = state => ({
  dashboardMapData: state.dashboardContentStore.filterData.mapData,
  selectedCountry: state.filterStore.selectedCategories.Country[0],
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
