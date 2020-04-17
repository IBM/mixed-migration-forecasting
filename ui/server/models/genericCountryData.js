const mongoose = require('mongoose');

const genericCountryData = new mongoose.Schema(
  {
    'Country Name': {
      type: String,
    },
    'Country Code': {
      type: String,
    },
    'Indicator Name': {
      type: String,
    },
    'Indicator Code': {
      type: String,
    },
    year: {
      type: String,
    },
    value: {
      type: String,
    },
  },
  { collection: 'GenericCountryData.worldbank' },
);

module.exports = mongoose.model(
  'GenericCountryData.worldbank',
  genericCountryData,
);
