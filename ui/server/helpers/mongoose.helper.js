const Incident = require('../models/incidents');
const CountryCoordinates = require('../models/CountryCoordinates');
const GenericCountryData = require('../models/genericCountryData');
const SARModel = require('../models/SituationalAssessmentReports');
const UserModel = require('../models/UserModel');
const SitRepFiles = require('../models/SitRepFiles');
const SitRepComments = require('../models/SitRepComments');
const countries = require('i18n-iso-countries');
const mongoose = require('mongoose');
// const fs = require('fs')

const incorrectCountries = ['Czechia', 'Macedonia', 'Moldova', 'United States'];
const incorrectCountriesCodes = ['CZE', 'MKD', 'MDA', 'USA'];

/**
 * Builds an `AND` mongoDB query to pass it into DB request
 * @param {Object} filters - List of data values for filtering
 */
const buildAndQuery = async filters => {
  let query = {};
  let tempSelectors = [];
  for (let category in filters) {
    if (Array.isArray(filters[category]) && filters[category].length > 0) {
      tempSelectors.push({ [category]: { $in: filters[category] } });
    }
  }
  query = tempSelectors.length > 1 ? { $and: tempSelectors } : tempSelectors[0];
  return query || {};
};

/**
 * Builds an `OR` mongoDB query to pass it into DB request
 * @param {Object} filters - List of data values for filtering
 */
const buildOrQuery = async filters => {
  let query = {};
  let tempSelectors = [];
  for (let category in filters) {
    if (Array.isArray(filters[category]) && filters[category].length > 0) {
      tempSelectors.push({ [category]: { $in: filters[category] } });
    }
  }
  query = tempSelectors.length > 1 ? { $or: tempSelectors } : tempSelectors[0];
  return query || {};
};

const getFilteredData = async filters => {
  const query = await buildAndQuery(filters);
  const incidents = await Incident.find(query);
  return incidents;
};

// const setFilteredData = async filters => {
//   const cert = fs.readFileSync(__dirname + '../../../db/data/worldbank_generic_country_data.json');
//   const incidentsData = JSON.parse(cert);
//   console.log(incidentsData[0])
//   incidentsData.forEach(el=>{
//     GenericCountryData.create(el);
//   })
//   // console.log(JSON.parse(cert)[0])
//   // const query = await buildAndQuery();
//   // const incidents = await Incident.find(query);
//   // return incidents;
//   return null;
// };

const getCategories = async () => {
  const data = await Incident.findOne();
  return Object.keys(data._doc);
};

const getCategoriesOptions = async (
  requestedCategories = [],
  filterOptions = {},
) => {
  const query = await buildOrQuery(filterOptions);
  let responce = {};
  let categories = [];
  categories =
    requestedCategories.length > 0
      ? requestedCategories
      : await getCategories();
  for (let category of categories) {
    let categoryOptions = await Incident.find(query).distinct(category);
    responce[category] = categoryOptions;
  }
  return responce;
};

const getIncidentsByCountriesCount = async filters => {
  const tempCountries = await getCategoriesOptions(['Country']);
  const countryNames = tempCountries['Country'];
  let responce = {};
  for (let filterName in filters) {
    filters[filterName] = filters[filterName].map(value => value.toString());
  }
  const query = await buildAndQuery(filters);
  for (let country of countryNames) {
    const tempCount = await Incident.aggregate([
      { $match: { $and: [{ Country: country }, query] } },
      { $count: country || 'Not Provided' },
    ]);
    const tempCountryName = incorrectCountries.includes(country)
      ? incorrectCountriesCodes[incorrectCountries.indexOf(country)]
      : countries.getAlpha3Code(country, 'en');
    responce[tempCountryName] = tempCount[0] ? tempCount[0][country] : 0;
  }
  return responce;
};

const getCountryIncidentsByYear = async () => {
  let responce = {};
  const tempGroupedData = await Incident.aggregate([
    {
      $group: {
        _id: '$Incident Report Year',
        countries: { $push: { country: '$Country' } },
      },
    },
  ]);
  tempGroupedData.forEach(recordsByYear => {
    let tempCountryRecords = {};
    recordsByYear.countries.forEach(el => {
      const country = el.country;
      const tempCountryName = incorrectCountries.includes(country)
        ? incorrectCountriesCodes[incorrectCountries.indexOf(country)]
        : countries.getAlpha3Code(country, 'en');
      tempCountryRecords[tempCountryName] =
        (tempCountryRecords[tempCountryName] || 0) + 1;
    });
    responce[recordsByYear._id] = tempCountryRecords;
  });
  return responce;
};

const getCountriesCoordinates = async () => {
  const data = await CountryCoordinates.find();
  return data;
};

const getGenericCountryData = async (year = '2014', countryCode = 'USA') => {
  let responce = {};
  const tempGroupedData = await GenericCountryData.aggregate([
    { $match: { $and: [{ year: year }, { 'Country Code': countryCode }] } },
    {
      $group: {
        _id: '$Country Code',
        indicators: { $push: { indName: '$Indicator Name', value: '$value' } },
      },
    },
  ]);
  tempGroupedData.forEach(countryRecords => {
    const tempIndicators = {};
    countryRecords.indicators.forEach(
      el => (tempIndicators[el.indName] = el.value),
    );
    responce[countryRecords._id] = tempIndicators;
  });
  return responce;
};

const setNewUser = async user => {
  let responce = '';
  const callback = (err, res) => {
    if (err !== null) {
      responce = `${err}\nAffected ${res.modifiedCount} documents in database`;
      console.log(responce);
    } else {
      responce = 'Successfully created user.';
    }
  };
  UserModel.create(user, callback);
  return responce;
};

const getUser = async (user = {}) => {
  const userEmail = user.email;
  const query = await buildAndQuery({
    email: [userEmail],
  });
  const data = await UserModel.findOne(query);
  if (data && data.password) {
    data.password = null;
  }
  return data;
};

const getAllUsers = async () => {
  const data = await UserModel.find();
  return data;
};

const updateUser = async (oldUser, newUser) => {
  let responce = '';
  const callback = (err, res) => {
    if (err !== null) {
      responce = `${err}\nAffected ${res.modifiedCount} documents in database`;
      console.log(responce);
    } else {
      responce = 'Successfully updated users data.';
    }
  };
  UserModel.updateOne(oldUser, newUser, callback);
  return responce;
};

const deleteUser = async user => {
  let responce = '';
  const callback = (err, res) => {
    if (err !== null) {
      responce = `${err}\nAffected ${res.modifiedCount} documents in database`;
      console.log(responce);
    } else {
      responce = 'Successfully deleted users data.';
    }
  };
  UserModel.deleteOne(user, callback);
  return responce;
};

const getAllSAReports = async () => {
  // const tempData = await SARModel.find();
  const tempData = await SARModel.aggregate([
    { $project: { conclusions: 0, file: 0 } },
    { $sort: { _id: -1 } },
  ]).limit(12);
  return tempData;
};

const getSingleSAReport = async query => {
  const tempQuery = query ? { _id: mongoose.Types.ObjectId(query) } : {};
  const data = await SARModel.findOne(tempQuery, {}, { sort: { _id: -1 } });
  return data;
};

const setNewSAReport = async report => {
  let responce = '';
  const callback = (err, res) => {
    if (err !== null) {
      responce = `${err}\nAffected ${res.modifiedCount} documents in database`;
      console.log(responce);
    } else {
      responce = 'Successfully created report.';
    }
  };
  SARModel.create(report, callback);
  return responce;
};

const setSitRepFiles = async files => {
  const data = await SitRepFiles.create(files);
  return data;
};

const getSitRepComments = async reportId => {
  const data = await SitRepComments.find({ sitRepId: reportId });
  return data;
};

const setSitRepComment = async files => {
  const data = await SitRepComments.create(files);
  return data;
};

const getSitRepFileByNameAndSarId = async query => {
  const data = await SitRepFiles.findOne(query);
  return data;
};

module.exports = {
  buildAndQuery: buildAndQuery,
  buildOrQuery: buildOrQuery,
  updateUser: updateUser,
  deleteUser: deleteUser,
  getAllUsers: getAllUsers,
  getAllSAReports: getAllSAReports,
  // setFilteredData:setFilteredData,
  getCategoriesOptions: getCategoriesOptions,
  getCountriesCoordinates: getCountriesCoordinates,
  getCountryIncidentsByYear: getCountryIncidentsByYear,
  getFilteredData: getFilteredData,
  getGenericCountryData: getGenericCountryData,
  getIncidentsByCountriesCount: getIncidentsByCountriesCount,
  getSingleSAReport: getSingleSAReport,
  getSitRepComments: getSitRepComments,
  getSitRepFileByNameAndSarId: getSitRepFileByNameAndSarId,
  getUser: getUser,
  setNewSAReport: setNewSAReport,
  setNewUser: setNewUser,
  setSitRepComment: setSitRepComment,
  setSitRepFiles: setSitRepFiles,
};
