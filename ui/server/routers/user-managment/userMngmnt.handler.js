const express = require('express');
const appID = require('ibmcloud-appid');
const axios = require('axios');
const cfenv = require('cfenv');
const WebAppStrategy = appID.WebAppStrategy;

let vcapLocal;
try {
  vcapLocal = require('../../../vcap-local.json');
  console.log('Loaded local VCAP');
} catch (e) {
  console.log(e);
}

const appEnvOpts = vcapLocal
  ? {
      vcap: vcapLocal,
    }
  : {};

const appEnv = cfenv.getAppEnv(appEnvOpts);
let services =
  Object.entries(appEnv.services).length === 0 &&
  appEnv.services.constructor === Object
    ? appEnvOpts.vcap
    : appEnv.services;

const config = services['AppID'][0].credentials;

const mongoHelpers = require('../../helpers/mongoose.helper');

const router = express.Router();

async function getBearerToken() {
  // TODO errorHandlers
  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'urn:ibm:params:oauth:grant-type:apikey');
    params.append('apikey', config.apikey);

    let options = {
      method: 'post',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      data: params,
    };

    let response = await axios({
      url: 'https://iam.ng.bluemix.net/oidc/token',
      ...options,
    });
    let obj = response.data;
    return obj['access_token'];
  } catch (e) {
    console.log('Cannot get Bearer token: (e)=' + e);
    return null;
  }
}

function _generateUserScim(body) {
  let userScim = {};
  if (body.password) {
    userScim.password = body.password;
  }
  userScim.active = body.active || true;
  userScim.emails = [];
  userScim.emails[0] = {
    value: body.email,
    primary: true,
  };
  if (body.phoneNumber) {
    userScim.phoneNumbers = [];
    userScim.phoneNumbers[0] = {
      value: body.phoneNumber,
    };
  }
  if (body.first_name || body.last_name) {
    userScim.name = {};
    if (body.first_name) {
      userScim.name.givenName = body.first_name;
    }
    if (body.last_name) {
      userScim.name.familyName = body.last_name;
    }
  }
  if (body.language) {
    userScim.locale = body.language;
  }
  return userScim;
}

router.post('/user-data', async (req, res) => {
  try {
    const userData =
      req.session[WebAppStrategy.AUTH_CONTEXT].identityTokenPayload;
    const isUserPresent = await mongoHelpers.getUser(userData);
    const user = {
      id: userData.id,
      first_name: userData.given_name,
      last_name: userData.family_name,
      role: 'Standard User',
      login: userData.given_name,
      email: userData.email,
      org_name: 'Other',
      org_type: 'Other',
    };
    if (!isUserPresent) {
      await mongoHelpers.setNewUser(user);
    }
    const responce = await mongoHelpers.getUser(userData);
    res.json(responce || user);
  } catch (err) {
    console.log('Error:', err);
    res.json({ err: err.message });
  }
});

router.post('/user-data-create', async (req, res) => {
  try {
    const { user } = req.body;
    const token = 'Bearer ' + (await getBearerToken());

    const options = {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: token,
      },
      data: JSON.stringify(_generateUserScim(user)),
    };

    let response = await axios({
      url: `${config.managementUrl}/cloud_directory/sign_up`,
      ...options,
    });
    const body = response.data;
    let result = {};

    if (body && body.id) {
      let currentEmail = body.emails[0].value;
      result.status = 200;
      result.statusText = 'Successfully created AppID user ' + currentEmail;
      user.id = body.id;
      await mongoHelpers.setNewUser(user);
    } else {
      console.log('error:', body);
      result.status = 500;
      result.statusText = 'Fail to create AppID user.';
    }
    res.json(result);
  } catch (err) {
    console.log('Error:', err);
    res.json({ err: err.message });
  }
});

router.post('/user-data-update', async (req, res) => {
  try {
    const { oldUser, newUser } = req.body;
    const token = 'Bearer ' + (await getBearerToken());

    const options = {
      method: 'put',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: token,
      },
      data: JSON.stringify(_generateUserScim(newUser)),
    };

    let response = await axios({
      url: `${config.managementUrl}/cloud_directory/Users/${oldUser.id}`,
      ...options,
    });
    const body = response.data;
    let result = {};
    let responce = {};

    if (body) {
      result.status = 200;
      responce = await mongoHelpers.updateUser(oldUser, newUser);
    } else {
      console.log('error:', body);
      result.status = 500;
      result.statusText = 'Fail to create AppID user.';
    }
    res.json(responce);
  } catch (err) {
    console.log('Error:', err);
    res.json({ err: err.message });
  }
});

router.delete('/user-data-delete', async (req, res) => {
  try {
    const { user } = req.body;
    const token = 'Bearer ' + (await getBearerToken());

    const options = {
      method: 'delete',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: token,
      },
    };

    let response = await axios({
      url: `${config.managementUrl}/cloud_directory/Users/${user.id}`,
      ...options,
    });
    const body = response.data;
    let result = {};
    let responce = {};
    responce = await mongoHelpers.deleteUser(user);

    if (response.status < 300) {
      result.status = 200;
      responce = await mongoHelpers.deleteUser(user);
    } else {
      console.log('error:', body);
      result.status = 500;
    }
    res.json(responce);
  } catch (err) {
    console.log('Error:', err);
    res.json({ err: err.message });
  }
});

router.get('/user-list-data', async (req, res) => {
  try {
    const token = 'Bearer ' + (await getBearerToken());

    const options = {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: token,
      },
    };

    let response = await axios({
      url: `${config.managementUrl}/cloud_directory/Users`,
      ...options,
    });
    const body = response.data;
    const presentIds = body['Resources'].map(el => el.id);
    let result = {};
    let responce = [];

    if (body) {
      result.status = 200;
      responce = await mongoHelpers.getAllUsers();
      responce = responce.filter(el => presentIds.includes(el.id));
    } else {
      console.log('error:', body);
      result.status = 500;
      result.statusText = 'Fail to create AppID user.';
    }
    res.json(responce);
  } catch (err) {
    console.log('Error:', err);
    res.json({ err: err.message });
  }
});

module.exports = router;
