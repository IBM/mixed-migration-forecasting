const mongoose = require('mongoose');

const SituationalAssessmentReportModel = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    status: {
      type: String,
    },
    authors: {
      type: String,
    },
    img: {
      type: String,
    },
    thumbnail: {
      type: String,
    },
    conclusions: {
      type: String,
    },
    filesId: {
      type: String,
    },
    filesMeta: {
      type: Array,
      required: false,
      default: [],
    },
    dataTrends: {
      type: String,
    },
  },
  { collection: 'SituationalAssessmentReports' },
);

module.exports = mongoose.model(
  'SituationalAssessmentReportModel',
  SituationalAssessmentReportModel,
);
