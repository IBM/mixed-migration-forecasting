import React, { useState } from 'react';
import MapGL, {
  Source,
  Layer,
  Marker,
  Popup,
  NavigationControl,
  FullscreenControl,
} from 'react-map-gl';
import BubbleMarker from './Markers/Marker';
import numeral from 'numeral';
import axios from 'axios';

import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
// import InputLabel from '@material-ui/core/InputLabel';

import List from '@material-ui/core/List';

import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';

import { Title } from '../common';
import { dataLayer } from './map-style.js';
import * as i18nIsoCountries from 'i18n-iso-countries';

import mapboxApiAccessToken from '../../creds/MapboxApiAccessToken';

const requiredGenericDataKeys = [
  'Population, total',
  'Population density (people per sq. km of land area)',
  'GDP per capita, PPP (current international $)',
  'Rural population',
  'Urban population',
  'Human Rights',
];

const MapboxDashboard = props => {
  const { genericCountryData, countryName } = props;
  const countryCode = i18nIsoCountries.getAlpha3Code(countryName, 'en');
  const genericData = Object.values(genericCountryData)[0];
  // const countryName = i18nIsoCountries.getName(countryCode, 'en');
  const [fillCountry, setFillCountry] = useState(null);
  const [isFullscreen, setFullscreen] = useState(false);
  const [availableCountries, setAvailableCountries] = useState([]);
  const [popupInfo, setPopupInfo] = useState(null);
  const [viewport, setViewport] = useState({
    latitude: 33.8564,
    longitude: 66.08669,
    zoom: 1,
    minZoom: 1,
    maxZoom: 5,
    bearing: 0,
    pitch: 0,
  });

  React.useEffect(() => {
    const tempFunc = async () => {
      const countries = await axios({
        method: 'get',
        url: '/api/available-countries',
        headers: {},
      });
      setAvailableCountries(countries.data.map(el => el['Country Name']));
    };
    tempFunc();
  }, {});

  const _onViewportChange = viewport => setViewport(viewport);

  const onEnterMarker = countryName => {
    setPopupInfo(countryName);
  };
  const onLeaveMarker = e => {
    e.stopPropagation();
    setPopupInfo(null);
  };

  const onClickMarker = countryName => {
    setPopupInfo(countryName);
  };

  const renderPopup = () => {
    return (
      <div style={{ pointerEvents: 'none', backgroundColor: '#666' }}>
        {popupInfo && genericCountryData.length > 0 ? (
          <Popup
            anchor="bottom"
            closeButton={true}
            closeOnClick={true}
            latitude={popupInfo.lat}
            longitude={popupInfo.lon}
            onClose={() => setPopupInfo(null)}
            tipSize={5}
            style={{ backgroundColor: '#666' }}
          >
            <Grid
              item
              lg={12}
              md={12}
              xs={12}
              style={{ backgroundColor: '#666' }}
            >
              {/* <Title>General Country Information(2014)</Title> */}
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <img
                      src={`https://www.countryflags.io/${i18nIsoCountries.alpha3ToAlpha2(
                        countryCode,
                      )}/shiny/32.png`}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={`Country: ${countryName}`}
                    secondary={''}
                  />
                </ListItem>
                {genericCountryData.map(el => (
                  <ListItem key={el['Indicator Name']}>
                    <ListItemText
                      key={el['Indicator Name']}
                      primary={`${el['Indicator Name']} (${el.year}): ${numeral(
                        el.value,
                      ).format('0.0[0]a') || ''}`}
                      secondary={''}
                    />
                  </ListItem>
                ))}
                <Divider />
                <ListItem>
                  <ListItemText
                    primary={`${popupInfo.name}: ${numeral(
                      popupInfo.text,
                    ).format('0.0[0]a') || ''}`}
                    secondary={''}
                  />
                </ListItem>
              </List>
            </Grid>

            {/* <CityInfo info={popupInfo} /> */}
          </Popup>
        ) : null}
      </div>
    );
  };

  const getForecastAndDaraTrend = (countryName, countryCode) => {
    setFillCountry(countryName);
    props.getDataByCountry({
      countries: countryCode,
      yearRange: '2010-2019',
      countryName: countryName,
    });
    props.updateSelectedCountry({
      Country: [countryCode],
    });
    props.getGenericCountryData({
      country: countryCode,
      years: 1,
      indicator:
        'SP.POP.TOTL,EN.POP.DNST,NY.GDP.PCAP.PP.CD,SP.RUR.TOTL,SP.URB.TOTL,FSI.HMN.RIG',
    });
  };

  const markerClick = marker => {
    setPopupInfo(marker);
    getForecastAndDaraTrend(marker.name, marker.country);
  };

  const _onClick = event => {
    const { features } = event;
    const fillCountry = features && features.find(f => f.layer.id === 'data');
    if (fillCountry && fillCountry.properties) {
      getForecastAndDaraTrend(
        fillCountry.properties.name,
        fillCountry.properties.iso_a3,
      );
    }
  };
  const flexLayer = {
    id: 'datas',
    type: 'fill',
    source: 'my-data',
    filter: [
      '==',
      'name_long',
      fillCountry || props.countryName || 'Afghanistan',
    ],
    paint: {
      'fill-color': {
        property: 'name_long',
        type: 'categorical',
        stops: [
          [
            fillCountry || props.countryName || 'Afghanistan',
            'rgba(242, 23, 7, 0.7)',
          ],
        ],
      },
      'fill-opacity': 1,
    },
  };

  const existForecastLayer = availableCountries.map(el => ({
    id: el,
    type: 'fill',
    source: 'my-data',
    filter: ['==', 'name', el],
    paint: {
      'fill-color': {
        property: 'name',
        type: 'categorical',
        stops: [[el, 'rgba(212, 179, 32, 0.7)']],
      },
      'fill-opacity': 0.3,
    },
  }));
  //  [
  //   {
  //     id: 'Myanmar',
  //     type: 'fill',
  //     source: 'my-data',
  //     filter: ['==', 'name', 'Myanmar'],
  //     paint: {
  //       'fill-color': {
  //         property: 'name',
  //         type: 'categorical',
  //         stops: [['Myanmar', 'rgba(212, 179, 32, 0.7)']],
  //       },
  //       'fill-opacity': 0.3,
  //     },
  //   },
  //   {
  //     id: 'Afghanistan',
  //     type: 'fill',
  //     source: 'my-data',
  //     filter: ['==', 'name', 'Afghanistan'],
  //     paint: {
  //       'fill-color': {
  //         property: 'name',
  //         type: 'categorical',
  //         stops: [['Afghanistan', 'rgba(212, 179, 32, 0.7)']],
  //       },
  //       'fill-opacity': 0.3,
  //     },
  //   },
  // ];
  let onlyValues = [];
  if (props.markersData) {
    onlyValues = props.markersData.map(el => el.text);
  }
  const maxValue = Math.max(...onlyValues);
  const averValue = onlyValues.reduce((a, b) => a + b, 0) / onlyValues.length;
  const maxradius = 5;
  return (
    <div id="dashboard-map-container">
      <MapGL
        {...viewport}
        height={isFullscreen ? '100vh' : '40rem'}
        mapboxApiAccessToken={mapboxApiAccessToken}
        mapStyle="mapbox://styles/mapbox/light-v9"
        onClick={_onClick}
        onViewportChange={_onViewportChange}
        preserveDrawingBuffer
        width="100%"
      >
        <div style={{ position: 'absolute', zIndex: '50' }}>
          <NavigationControl
            onViewportChange={_onViewportChange}
            showCompass={false}
          />
        </div>
        <div
          onClick={() => setFullscreen(!isFullscreen)}
          style={{ position: 'absolute', right: 0, zIndex: '50' }}
        >
          <FullscreenControl
            container={document.querySelector('#dashboard-map-container')}
          />
        </div>
        <Source
          data="https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_countries.geojson"
          id="my-data"
          type="geojson"
        >
          {props.markersData &&
            props.markersData.map(marker => {
              const positionAndSize = Math.ceil(
                (((maxradius * ((marker.text * 100) / maxValue)) / 100) *
                  viewport.zoom) /
                  (averValue >= maxValue / 2 ? 3 : 1),
              );
              return (
                <Marker
                  key={marker.name}
                  latitude={marker.lat}
                  longitude={marker.lon}
                  offsetLeft={(-positionAndSize * viewport.zoom) / 2}
                  offsetTop={(-positionAndSize * viewport.zoom) / 2}
                >
                  <BubbleMarker
                    onClick={() => markerClick(marker)}
                    // onEnterMarker={() => onEnterMarker(marker)}
                    // onLeaveMarker={e => onLeaveMarker(e)}
                    style={{
                      background: 'rgba(50, 136, 189, 0.5)',
                      height: (positionAndSize + 5) * viewport.zoom,
                      width: (positionAndSize + 5) * viewport.zoom,
                      fontSize: `${0.15 * viewport.zoom}rem`,
                    }}
                  >
                    {viewport.zoom > 2 &&
                      numeral(marker.text).format('0.0[0]a')}
                  </BubbleMarker>
                </Marker>
              );
            })}
          {renderPopup()}
          <Layer {...dataLayer} />
          {existForecastLayer.map(el => (
            <Layer {...el} key={el.id} />
          ))}
          <Layer {...flexLayer} />
        </Source>
      </MapGL>
    </div>
  );
};

export default MapboxDashboard;
