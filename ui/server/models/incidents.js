const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema(
  {
    'Control Method': {
      type: String,
    },
    Coordinates: {
      type: String,
    },
    Count: {
      type: Number,
    },
    Country: {
      type: String,
    },
    'Data Provider': {
      type: String,
    },
    'Data Source': {
      type: String,
    },
    'Destination Country': {
      type: String,
    },
    'Incident End Date': {
      type: String,
    },
    'Incident Report Date': {
      type: String,
    },
    'Incident Report Day': {
      type: String,
    },
    'Incident Report Month': {
      type: String,
    },
    'Incident Report Year': {
      type: String,
    },
    'Incident Reporting Date': {
      type: String,
    },
    'Incident Start Date': {
      type: String,
    },
    'Info Source': {
      type: String,
    },
    'Is Incident': {
      type: String,
    },
    'Location Type': {
      type: String,
    },
    'Recruitment Method': {
      type: String,
    },
    'Source Country': {
      type: String,
    },
    'Trafficker Age': {
      type: String,
    },
    'Trafficker Gender': {
      type: String,
    },
    'Trafficker Nationality': {
      type: String,
    },
    'Trafficking Sub-Type': {
      type: String,
    },
    'Trafficking Type': {
      type: String,
    },
    'Transit Country': {
      type: String,
    },
    'Transportation Method': {
      type: String,
    },
    'Victim Age': {
      type: String,
    },
    'Victim Gender': {
      type: String,
    },
    'Victim Nationality': {
      type: String,
    },
  },
  { collection: 'Incidents' },
);

module.exports = mongoose.model('Incident', incidentSchema);
