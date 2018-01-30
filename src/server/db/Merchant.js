const connector = require('./connector');
const { getResultObject } = require('server/utils');
const logger = require('server/logger');
const config = require('server/config');

const create = (session, idCategory, name) => {
  const rows = [];

  return session
    .executeSql(
      `CALL ${config.dbConfig.database}.MerchantCreate(?, ?)`,
      idCategory,
      name,
    )
    .execute((row) => {
      rows.push(row);
    })
    .then(() => {
      const result = connector.processSelectResultset(rows);
      return result;
    })
    .catch((err) => {
      const result = getResultObject();
      result.meta.errorCode = 'InternalError';
      result.meta.errorMessage = 'Error registering new merchant';
      result.data = null;
      logger.error('Error registering new merchant', err);
      return result;
    });
};

module.exports = {
  create,
};
