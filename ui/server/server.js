const appName = require('./../package').name;
const http = require('http');
const axios = require('axios');
const bodyParser = require('body-parser');
const express = require('express');
const log4js = require('log4js');
const mongoose = require('mongoose');
const path = require('path');
require('ibm-cloud-env').init();
require('dotenv').config();
const session = require('express-session');
const passport = require('passport');
const appID = require('ibmcloud-appid');
const WebAppStrategy = appID.WebAppStrategy;

const app = express();

//Custom routers
const mongoRouter = require('./routers/root');
const publicRouter = require('./routers/public');

const logger = log4js.getLogger(appName);
logger.level = process.env.LOG_LEVEL || 'info';

// Now lets get cfenv and ask it to parse the environment variable
const cfenv = require('cfenv');

// load local VCAP configuration  and service credentials
let vcapLocal;
try {
  vcapLocal = require('../vcap-local.json');
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
console.log(appEnv);
// Within the application environment (appenv) there's a services object
let services =
  Object.entries(appEnv.services).length === 0 &&
  appEnv.services.constructor === Object
    ? appEnvOpts.vcap
    : appEnv.services;

const CALLBACK_URL = '/home';

// Setup express application to use express-session middleware
// Must be configured with proper session storage for production
// environments. See https://github.com/expressjs/session for
// additional documentation
app.use(
  session({
    secret: '123456',
    resave: true,
    saveUninitialized: true,
    proxy: true,
  }),
);

// Configure express application to use passportjs
app.use(passport.initialize());
app.use(passport.session());

let webAppStrategy = new WebAppStrategy(getAppIDConfig(services));
passport.use(webAppStrategy);

// Configure passportjs with user serialization/deserialization. This is required
// for authenticated session persistence accross HTTP requests. See passportjs docs
// for additional information http://passportjs.org/docs
passport.serializeUser((user, cb) => cb(null, user));
passport.deserializeUser((obj, cb) => cb(null, obj));

// Callback to finish the authorization process. Will retrieve access and identity tokens/
// from AppID service and redirect to either (in below order)
// 1. the original URL of the request that triggered authentication, as persisted in HTTP session under WebAppStrategy.ORIGINAL_URL key.
// 2. successRedirect as specified in passport.authenticate(name, {successRedirect: "...."}) invocation
// 3. application root ("/")
app.get(
  CALLBACK_URL,
  passport.authenticate(WebAppStrategy.STRATEGY_NAME, {
    failureRedirect: '/error',
  }),
);

// Protect everything under /protected

let options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: true,
  sslValidate: true,
  sslCA: process.env.NODE_ENV === 'dev' ? process.env.DB_CERTIFICATE_CA : '',
};

let connectionString = null;
// The services object is a map named by service so we extract the one for MongoDB
let mongodbServices = services['databases-for-mongodb'];
if (mongodbServices !== undefined) {
  // We now take the first bound MongoDB service and extract it's credentials object
  let mongodbConn = mongodbServices[0].credentials.connection.mongodb;

  // Read the CA certificate and assign that to the CA variable
  let ca = [Buffer.from(mongodbConn.certificate.certificate_base64, 'base64')];

  // We always want to make a validated TLS/SSL connection
  options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    ssl: true,
    sslValidate: true,
    sslCA: ca,
  };

  // Extract the database username and password
  let authentication = mongodbConn.authentication;
  let username = authentication.username;
  let password = authentication.password;

  // Extract the MongoDB URIs
  let connectionPath = mongodbConn.hosts;
  connectionString = `mongodb://${username}:${password}@${connectionPath[0].hostname}:${connectionPath[0].port},${connectionPath[1].hostname}:${connectionPath[1].port}/DRC-S2-TDP?authSource=admin&replicaSet=replset`;
}

mongoose.connect(
  connectionString ||
    process.env.DB_URL ||
    'mongodb://localhost:27017/DRC-S2-TDP',
  options,
);
const db = mongoose.connection;
db.on('error', error => logger.error(error));
db.once('open', () => logger.info('connected to database'));

const server = http.createServer(app);

// parse application/x-www-form-urlencoded
app.use(
  bodyParser.urlencoded({
    limit: '50mb',
    extended: true,
    parameterLimit: 50000,
  }),
);
// parse application/json
app.use(bodyParser.json({ limit: '50mb' }));

// logger connection
app.use(log4js.connectLogger(logger, { level: logger.level }));

app.get('/logout', (req, res) => {
  WebAppStrategy.logout(req);
  res.redirect('/');
});

app.get('/error', (req, res) => {
  res.send('Authentication Error');
});

app.use('/', passport.authenticate(WebAppStrategy.STRATEGY_NAME));
//Serves the identity token payload
app.get('/protected/api/idPayload', (req, res) => {
  res.send(req.session[WebAppStrategy.AUTH_CONTEXT].identityTokenPayload);
});

// custom rotes connection
app.use('/api', [
  mongoRouter,
  passport.authenticate(WebAppStrategy.STRATEGY_NAME, { session: false }),
]);
// app.use('/imbedded', iframeRouter);
app.use('/', publicRouter);

const port = process.env.PORT || 8264;
server.listen(port, () => {
  logger.info(
    `DRC Solution 2 - Total Displaced Persons is listening on http://localhost:${port}`,
  );
});

function getAppIDConfig(services) {
  let config;
  try {
    config = services['AppID'][0].credentials;
    config.redirectUri = (process.env.APP_URL || appEnv.url) + CALLBACK_URL;
  } catch (e) {
    if (process.env.APPID_SERVICE_BINDING) {
      // if running on Kubernetes this env variable would be defined
      config = JSON.parse(process.env.APPID_SERVICE_BINDING);
      config.redirectUri = process.env.redirectUri;
    } else {
      // running on CF
      // let vcapApplication = JSON.parse(process.env['VCAP_APPLICATION']);
      return {
        redirectUri: 'http://localhost:8264' + CALLBACK_URL,
      };
    }
  }
  return config;
}
