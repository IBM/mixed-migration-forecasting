const mongoose = require('mongoose');

const countryCoordinates = new mongoose.Schema(
  {
    Country: {
      type: String,
    },
    'Country code': {
      type: String,
    },
    Longitude: {
      type: String,
    },
    Latitude: {
      type: String,
    },
  },
  { collection: 'CountriesCoordinates' },
);

module.exports = mongoose.model('CountryCoordinates', countryCoordinates);
