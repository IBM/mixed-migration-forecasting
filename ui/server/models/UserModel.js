const mongoose = require('mongoose');

const userModel = new mongoose.Schema(
  {
    id: {
      type: String,
    },
    first_name: {
      type: String,
    },
    last_name: {
      type: String,
    },
    role: {
      type: String,
    },
    login: {
      type: String,
    },
    email: {
      type: String,
    },
    org_type: {
      type: String,
    },
    org_name: {
      type: String,
    },
    prof_img: {
      type: String,
    },
  },
  { collection: 'Users' },
);

module.exports = mongoose.model('UserModel', userModel);
