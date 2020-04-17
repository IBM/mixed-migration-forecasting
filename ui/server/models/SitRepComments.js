const mongoose = require('mongoose');

const SitRepComments = new mongoose.Schema(
  {
    sitRepId: {
      type: String,
    },
    userName: {
      type: String,
    },
    userLastName: {
      type: String,
    },
    commentText: {
      type: String,
    },
  },
  { collection: 'SitRepComments' },
);

module.exports = mongoose.model('SitRepComments', SitRepComments);
