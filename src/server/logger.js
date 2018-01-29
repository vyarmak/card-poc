const winston = require('winston');
const WinstonDailyRotate = require('winston-daily-rotate-file');
const config = require('server/config');
const {
  isObject,
  isDefinedAndNotNull,
} = require('check-tool');

const logLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    data: 3,
    debug: 4,
    silly: 5,
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    data: 'cyan',
    debug: 'blue',
    silly: 'magenta',
  },
};

const logger = new (winston.Logger)({
  levels: logLevels.levels,
  level: 'debug',
  transports: [
    new (WinstonDailyRotate)({
      name: 'error-file',
      filename: config.logs.error,
      level: 'error',
      json: false,
      timestamp() {
        return new Date().toJSON();
      },
      formatter(options) {
        return `${options.timestamp()} - ${options.level.toUpperCase()} - ${(options.message ? options.message : '')} - ${(options.meta && Object.keys(options.meta).length ? JSON.stringify(options.meta) : '')}`;
      },
    }),
    new (WinstonDailyRotate)({
      name: 'info-file',
      filename: config.logs.info,
      level: 'info',
      json: false,
      timestamp() {
        return new Date().toJSON();
      },
      formatter(options) {
        return `${options.timestamp()} - ${options.level.toUpperCase()} - ${(options.message ? options.message : '')} - ${(options.meta && Object.keys(options.meta).length ? JSON.stringify(options.meta) : '')}`;
      },
    }),
    new (WinstonDailyRotate)({
      name: 'debug-file',
      filename: config.logs.debug,
      level: 'debug',
      json: false,
      timestamp() {
        return new Date().toJSON();
      },
      formatter(options) {
        return `${options.timestamp()} - ${options.level.toUpperCase()} - ${(options.message ? options.message : '')} - ${(options.meta && Object.keys(options.meta).length ? JSON.stringify(options.meta) : '')}`;
      },
    }),
  ],
});

const log = (channel, obj, meta) => {
  const message = isObject(obj) ? JSON.stringify(obj) : obj;
  if (config.debug !== undefined && config.debug) {
    let logMessage = `${(new Date()).toJSON()} [${channel.toUpperCase()}]: ${message}`;
    if (isDefinedAndNotNull(meta)) {
      logMessage += ` : ${JSON.stringify(meta)}`;
    }
    console.log(logMessage);
  }
  logger.log(channel, message, meta);
};
/**
 * Write a error log message
 * @param  {Object} message message to be logged
 */
const error = (obj, meta) => {
  log('error', obj, meta);
};
/**
 * Write a info log message
 * @param  {Object} message message to be logged
 */
const info = (obj, meta) => {
  log('info', obj, meta);
};
/**
 * Write a debug log message
 * @param  {Object} message message to be logged
 */
const debug = (obj, meta) => {
  log('debug', obj, meta);
};

module.exports = {
  error,
  info,
  debug,
};
