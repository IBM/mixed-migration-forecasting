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

import { dataLayer } from './map-style.js';
import mapboxApiAccessToken from '../../creds/MapboxApiAccessToken';

const MapboxMap = props => {
  const [isFullscreen, setFullscreen] = useState(false);
  const [fillCountry, setFillCountry] = useState(null);
  const [availableCountries, setAvailableCountries] = useState([]);
  const [popupInfo, setPopupInfo] = useState(null);
  const [viewport, setViewport] = useState({
    latitude: 33.8564,
    longitude: 66.08669,
    zoom: 2,
    minZoom: 2,
    maxZoom: 7,
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

  const renderPopup = () => {
    return (
      <div style={{ pointerEvents: 'none' }}>
        {popupInfo && (
          <Popup
            anchor="bottom"
            closeButton={false}
            closeOnClick={false}
            latitude={popupInfo.lat}
            longitude={popupInfo.lon}
            onClose={() => setPopupInfo(null)}
            tipSize={5}
          >
            <div style={{ pointerEvents: 'none' }}>
              <b>{popupInfo.name}:</b>
              {` ${numeral(popupInfo.text).format('0.0[0]a')}`}
              {/* <span style={{ fontWeight: 600, fontSize: 13 }}>
                {popupInfo.name}:
              </span>
              <span style={{ fontWeight: 300, fontSize: 11 }}>
                {numeral(popupInfo.text).format('0.0[0]a')}
              </span> */}
            </div>

            {/* <CityInfo info={popupInfo} /> */}
          </Popup>
        )}
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
    props.getForecastByCountry({
      source: countryCode,
      countries: countryCode,
      year: '2019',
      years: '2010-2019',
      indicators: 'DRC.TOT.DISP',
    });
    props.updateSelectedCountry({
      Country: [countryCode],
    });
    props.clearUserForecastData();
  };

  const markerClick = marker => {
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
  // [
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
  const maxradius = 5;
  const hexDec = h => {
    var m = h.slice(1).match(/.{2}/g);

    m[0] = parseInt(m[0], 16);
    m[1] = parseInt(m[1], 16);
    m[2] = parseInt(m[2], 16);
    m[3] = 0.5;
    return `rgba(${m.join(',')})`;
  };

  const perc2color = perc => {
    let r,
      g,
      b = 0;
    if (perc < 50) {
      r = 145;
      g = Math.round(perc * 60);
    } else {
      g = 0;
      r = Math.round(510 - 1.1 * perc);
    }
    let h = r * 0x10000 + g * 0x100 + b * 0x1;
    return hexDec('#' + ('000000' + h.toString(16)).slice(-6));
  };
  return (
    <div id="home-map-container">
      <MapGL
        {...viewport}
        height={isFullscreen ? '100vh' : '400px'}
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
            container={document.querySelector('#home-map-container')}
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
                ((maxradius * ((marker.text * 100) / maxValue)) / 100) *
                  viewport.zoom,
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
                    onEnterMarker={() => onEnterMarker(marker)}
                    onLeaveMarker={e => onLeaveMarker(e)}
                    style={{
                      backgroundColor: perc2color(
                        Math.ceil((marker.text * 100) / maxValue) + 2,
                      ),
                      height: (positionAndSize + 5) * viewport.zoom,
                      width: (positionAndSize + 5) * viewport.zoom,
                      fontSize: `${0.15 * viewport.zoom}rem`,
                    }}
                  >
                    {numeral(marker.text).format('0.0[0]a')}
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
export default MapboxMap;
