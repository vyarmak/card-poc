const mysqlx = require('@mysql/xdevapi');
const { isDefinedAndNotNull, isDefinedAndNotEmpty } = require('check-tool');

const config = require('server/config');
const { getResultObject } = require('server/utils');

/**
 * Get mysql session
 */
const getSession = () =>
  mysqlx.getSession({
    host: config.dbConfig.host,
    port: config.dbConfig.port,
    dbUser: config.dbConfig.user,
    dbPassword: config.dbConfig.password,
  });

/**
 * Get mysql schema
 * @param {Object} session mysql session
 */
const getSchema = (session) => session.getSchema(config.dbConfig.database);

/**
 * Convert resultset to a result object
 * @param {Array} resultset resultset array
 */
const processSelectResultset = (resultset) => {
  const result = getResultObject();
  result.data = resultset[0];
  result.meta.count = resultset[0].length;
  if (isDefinedAndNotNull(resultset[1])) {
    result.meta.count = resultset[1][0];
    if (isDefinedAndNotEmpty(resultset[1][1])) {
      result.meta = {
        errorCode: resultset[1][1],
        errorMessage: resultset[1][2],
      };
    }
  }
  return result;
};

module.exports = {
  getSession,
  getSchema,
  processSelectResultset,
};
