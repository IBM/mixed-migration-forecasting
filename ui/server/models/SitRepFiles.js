const mongoose = require('mongoose');

const SitRepFiles = new mongoose.Schema(
  {
    sitRepFileId: {
      type: String,
    },
    fileName: {
      type: String,
    },
    fileEncoded: {
      type: String,
    },
  },
  { collection: 'SitRepFiles' },
);

module.exports = mongoose.model('SitRepFiles', SitRepFiles);
