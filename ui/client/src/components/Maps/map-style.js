export const dataLayer = {
  id: 'data',
  type: 'fill',
  source: 'my-data',
  paint: {
    'fill-color': {
      property: 'name',
      type: 'categorical',
      stops: [[0, '#3288bd']],
    },
    'fill-opacity': 0,
  },
};
