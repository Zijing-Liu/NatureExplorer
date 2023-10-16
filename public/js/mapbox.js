// const locations = JSON.parse(documents.getElementById('map').dataset.locations);

// mapboxgl.accessToken =
//   'pk.eyJ1IjoiemlqaW5nY2VsaW5lbCIsImEiOiJjbG5vd2d6cTkwaGkyMm9xbXhjZTI3OWN6In0.6pI6FAqg0PqIPRZWTruiKw';
// var map = new mapboxgl.Map({
//   container: 'map',
//   style: 'mapbox://styles/zijingcelinel/clnoz3buf00ud01rdctd16q3x',
//   center: [],
// });

/* eslint-disable */
export const displayMap = (locations) => {
  mapboxgl.accessToken = mapboxgl.accessToken = process.env.MAPBOX_PUBLIC_TOKEN;

  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/zijingcelinel/clnoz3buf00ud01rdctd16q3x',
    scrollZoom: false,
    // center: [-118.113491, 34.111745],
    // zoom: 10,
    // interactive: false
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
