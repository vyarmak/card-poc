const path = require('path');

const config = {};

config.salt = 'DaskqKLDA,.xa#!!ada';
config.cardValidityYears = 5;

config.port = process.env.PORT || 3010;
config.appPath = path.join(__dirname, '../..');
/** upload dir */
config.uploadDir = path.join(config.appPath, 'upload');
/** public dir */
config.publicDir = path.join(config.appPath, 'public');
config.assetsDir = path.join(config.appPath, 'public/assets');

if (process.env.NODE_ENV === 'production') {
  config.debug = process.env.DEBUG || false;
  config.fqdn = 'http://cards.yarmakconsulting.com/';
  config.logs = {
    error: '/var/log/node/error.cards.log',
    info: '/var/log/node/info.cards.log',
    debug: '/var/log/node/debug.cards.log',
  };
} else {
  config.debug = process.env.DEBUG || true;
  config.fqdn = 'http://cards.local/';
  config.logs = {
    error: `${config.appPath}/logs/error.cards.log`,
    info: `${config.appPath}/logs/info.cards.log`,
    debug: `${config.appPath}/logs/debug.cards.log`,
  };
}

config.dbConfig = {
  host: '127.0.0.1',
  port: 33060,
  user: 'cards',
  password: 'cards',
  database: 'cards',
  multipleStatements: true,
  timezone: 'utc',
  schema: {
    tableName: 'Session',
    columnNames: {
      session_id: 'idSession',
      expires: 'expires',
      data: 'data',
    },
  },
};

if (process.env.DB_CONFIG) {
  try {
    config.dbConfig = JSON.parse(process.env.DB_CONFIG);
  } catch (e) {
    console.log('Error parsing DB_CONFIG. Check that DB_CONFIG is a valid JSON.');
  }
}

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

config.port = normalizePort(config.port);

module.exports = config;
