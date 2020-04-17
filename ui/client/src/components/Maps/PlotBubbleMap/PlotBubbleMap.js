import React, { useState } from 'react';
import MapGL, {
  Source,
  Marker,
  Popup,
  NavigationControl,
  FullscreenControl,
} from 'react-map-gl';
import BubbleMarker from '../Markers/Marker';
import numeral from 'numeral';
import mapboxApiAccessToken from '../../../creds/MapboxApiAccessToken';

const MainMap = props => {
  const [isFullscreen, setFullscreen] = useState(false);
  const [popupInfo, setPopupInfo] = useState(null);
  const [viewport, setViewport] = useState({
    latitude: 17.34555,
    longitude: 9.32443,
    zoom: 2,
    minZoom: 2,
    maxZoom: 7,
    bearing: 0,
    pitch: 0,
  });

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
            latitude={popupInfo.longitude}
            longitude={popupInfo.latitude}
            onClose={() => setPopupInfo(null)}
            tipSize={5}
          >
            <div style={{ pointerEvents: 'none', fontSize: '1rem' }}>
              <b>{popupInfo.name}:</b>
              {` ${numeral(popupInfo.yeild).format('0.0[0]a')}`}
              {/* <span style={{ fontWeight: 600, fontSize: 13 }}>
                {popupInfo.name}:
              </span>
              <span style={{ fontWeight: 300, fontSize: 11 }}>
                {numeral(popupInfo.yeild).format('0.0[0]a')}
              </span> */}
            </div>

            {/* <CityInfo info={popupInfo} /> */}
          </Popup>
        )}
      </div>
    );
  };

  const _onViewportChange = viewport => setViewport(viewport);

  let filteredData = null;
  let onlyValues = [];
  let maxValue = null;
  if (props.data) {
    filteredData = props.data.filter(
      el =>
        // el.latitude >= -90 &&
        // el.latitude <= 90 &&
        el.longitude >= -90 && el.longitude <= 90,
    );
  }

  onlyValues = filteredData.map(el => el.yeild);
  maxValue = Math.max(...onlyValues);
  const averValue = onlyValues.reduce((a, b) => a + b, 0) / onlyValues.length;

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
  // console.log(averValue)
  // console.log(maxValue)
  return (
    <div id="timeline-map-container">
      <MapGL
        {...viewport}
        height={isFullscreen ? '100vh' : 'calc(100vh - 16rem)'}
        mapboxApiAccessToken={mapboxApiAccessToken}
        mapStyle="mapbox://styles/mapbox/light-v9"
        onViewportChange={_onViewportChange}
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
            container={document.querySelector('#timeline-map-container')}
          />
        </div>
        <Source
          data="https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_countries.geojson"
          id="my-data"
          type="geojson"
        >
          {filteredData.map(marker => {
            const positionAndSize = Math.ceil(
              ((props.maxRadius * ((marker.yeild * 100) / maxValue)) / 100) *
                viewport.zoom,
            );
            return (
              <Marker
                key={marker.name}
                latitude={marker.longitude}
                longitude={marker.latitude}
                offsetLeft={(-positionAndSize * viewport.zoom) / 2}
                offsetTop={(-positionAndSize * viewport.zoom) / 2}
              >
                <BubbleMarker
                  onEnterMarker={() => onEnterMarker(marker)}
                  onLeaveMarker={e => onLeaveMarker(e)}
                  style={{
                    backgroundColor: perc2color(
                      Math.ceil((marker.yeild * 100) / maxValue) + 2,
                    ),
                    height: (positionAndSize + 6) * viewport.zoom,
                    width: (positionAndSize + 6) * viewport.zoom,
                    fontSize: `${0.2 * viewport.zoom}rem`,
                  }}
                >
                  {numeral(marker.yeild).format('0.0[0]a')}
                </BubbleMarker>
              </Marker>
            );
          })}
          {renderPopup()}
        </Source>
      </MapGL>
    </div>
  );
};
export default MainMap;
