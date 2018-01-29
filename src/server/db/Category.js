const connector = require('./connector');
const utils = require('server/utils');
const logger = require('server/logger');

const findAll = (session) => {
  const result = utils.getResultObject();
  const table = connector.getSchema(session).getTable('Category');

  result.data = [];

  return table
    .select()
    .execute((row) => {
      result.data.push(row);
    })
    .then(() => {
      result.meta.count = result.data.length;
      return result;
    }).catch((err) => {
      result.meta.errorCode = 'InternalError';
      result.meta.errorMessage = 'Error getting categories';
      result.data = null;
      logger.error('Error getting categories', err);
      return result;
    });
};

module.exports = {
  findAll,
};
