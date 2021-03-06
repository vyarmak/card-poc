const connector = require('./connector');
const { getResultObject, toMySQLDate } = require('server/utils');
const logger = require('server/logger');
const config = require('server/config');

const create = (session, number, name, issuedDate, expiryDate, cvv, encodedPin) => {
  const rows = [];

  return session
    .executeSql(
      `CALL ${config.dbConfig.database}.CardCreate(?, ?, ?, ?, ?, ?)`,
      number,
      name,
      toMySQLDate(issuedDate),
      toMySQLDate(expiryDate),
      cvv,
      encodedPin,
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
      result.meta.errorMessage = 'Error creating card';
      result.data = null;
      logger.error('Error creating card', err);
      return result;
    });
};

const deposit = (session, number, amount) => {
  const rows = [];

  return session
    .executeSql(
      `CALL ${config.dbConfig.database}.CardDeposit(?, ?)`,
      `${number}`,
      `${amount}`,
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
      result.meta.errorMessage = 'Error uploading funds to card';
      result.data = null;
      logger.error('Error uploading funds to card', err);
      return result;
    });
};

const getByNumberAndPin = (session, number, pin) => {
  const rows = [];

  return session
    .executeSql(
      `CALL ${config.dbConfig.database}.CardGetByNumberAndPin(?, ?)`,
      number,
      pin,
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
      result.meta.errorMessage = 'Error getting card information';
      result.data = null;
      logger.error('Error getting card information', err);
      return result;
    });
};

const validate = (session, number, name, expiryDate, cvv, pin) => {
  const rows = [];

  return session
    .executeSql(
      `CALL ${config.dbConfig.database}.CardValidate(?, ?, ?, ?, ?)`,
      number,
      name,
      expiryDate,
      cvv,
      pin,
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
      result.meta.errorMessage = 'Error getting card information';
      result.data = null;
      logger.error('Error getting card information', err);
      return result;
    });
};

module.exports = {
  create,
  deposit,
  getByNumberAndPin,
  validate,
};
