import React from 'react';
import Helmet from 'react-helmet';
import L from 'leaflet';

import Layout from 'components/Layout';
import Map from 'components/Map';

const LOCATION = {
  lat: 38.9072,
  lng: -77.0369
};
const CENTER = [LOCATION.lat, LOCATION.lng];
const DEFAULT_ZOOM = 2;


const IndexPage = () => {
  
  /**
   * mapEffect
   * @description Fires a callback once the page renders
   * @example Here this is and example of being used to zoom in and set a popup on load
   */
  async function mapEffect({ leafletElement: map } = {}) {
    if ( !map ) return;
    
    let response;
    try {
      const responseData = await fetch('https://corona.lmao.ninja/countries');
      response = await responseData.json()
    } catch(e) {
      console.log(`Failed to fetch countries: ${e.message}`, e);
      return;
    }

    const hasData = Array.isArray(response) && response.length > 0;
    if ( !hasData ) return;

    const geoJson = {
      type: "FeatureCollection",
      features: response.map((country = {}) => {
        const { countryInfo = {} } = country;
        const { lat, long: lng, flag } = countryInfo;
        return {
          type: "Feature",
          properties: {
            ...country,
            flag
          },
          geometry: {
            type: "Point",
            coordinates: [ lng, lat ]
          }
        }
      })
    }

    const geoJsonLayers = new L.GeoJSON(geoJson, {
      pointToLayer: (feature = {}, latlng) => {
        const { properties = {} } = feature;
        let updatedFormatted, casesString, casesCondition;
    
        const {
          country,
          updated,
          cases,
          deaths,
          recovered,
          flag,
          todayCases,
          todayDeaths,
          active
        } = properties
        casesString = `${cases}`;
        if(cases > 10000){
          casesCondition = "high";
        }
        else if(cases < 10000 && cases > 5000){
          casesCondition = "morderate";
        }
        else if(cases < 5000 && cases > 1000){
          casesCondition = "average";
        }
        else{
          casesCondition = "low";
        }
        if ( cases > 1000 ) {
          casesString = `${casesString.slice(0, -3)}k+`
        }
    
        if ( updated ) {
          updatedFormatted = new Date(updated).toLocaleString();
        }
    
        const html = `
          <span class="icon-marker ${casesCondition}-risk">
            <span class="icon-marker-tooltip">
              <h2>
                <img src="${flag}" alt="${country}" width="40" height="40">
                ${country}
              </h2>
              <ul>
                <li><strong>Confirmed:</strong>
                  <span class="info bold"> ${cases.toLocaleString('en-IN').split('.00')[0]}</span>
                </li>
                <li><strong>Deaths:</strong>
                  <span class="danger bold"> ${deaths.toLocaleString('en-IN').split('.00')[0]}</span>
                </li>
                <li><strong>Recovered:</strong>
                  <span class="safe bold"> ${recovered.toLocaleString('en-IN').split('.00')[0]}</span>
                </li>
                <li><strong>Active:</strong>
                  <span class="info bold"> ${active.toLocaleString('en-IN').split('.00')[0]}</span>
                </li>
                <li><strong>Deaths today:</strong>
                  <span class="${todayDeaths > 0 ? "danger" : "safe"} bold"> ${todayDeaths.toLocaleString('en-IN').split('.00')[0]}</span>
                </li>
                <li><strong>New cases today:</strong>
                  <span class="${todayCases > 0 ? "danger" : "safe"} bold"> ${todayCases.toLocaleString('en-IN').split('.00')[0]}</span>
                </li>
                <li><strong>Updated on:</strong> ${updatedFormatted}</li>
              </ul>
            </span>
            ${ casesString }
          </span>
        `;
    
        return L.marker( latlng, {
          icon: L.divIcon({
            className: "icon",
            html
          }),
          riseOnHover: true
        });
      }
    });

    geoJsonLayers.addTo(map)
  }

  const mapSettings = {
    center: CENTER,
    defaultBaseMap: 'OpenStreetMap',
    zoom: DEFAULT_ZOOM,
    mapEffect
  };

  return (
    <Layout pageName="home">
      <Helmet>
        <title>COVID-19 Dashboard</title>
      </Helmet>
      <Map {...mapSettings} />
    </Layout>
  );
};

export default IndexPage;
