const { isDefinedAndNotEmpty } = require('check-tool');

const connector = require('./connector');
const config = require('server/config');
const { getResultObject } = require('server/utils');
const logger = require('server/logger');
const Transaction = require('server/bean/Transaction');

const getTransactionsByNumberAndPin = (session, number, pin, start, end) => {
  const rows = [[], []];
  const sqlParams = [];
  const sqlString = [];
  const sqlQueryCount = 'SELECT FOUND_ROWS() AS totalRecords, "" AS errCode, "" AS errMessage';
  let sqlQuery = `SELECT SQL_CALC_FOUND_ROWS 
    Transaction.idTransaction, 
    Transaction.idCard, 
    Transaction.createdAt,
    Transaction.type,
    Transaction.amount,
    Transaction.amountCaptured,
    Transaction.idCategory,
    Transaction.idMerchant,
    Category.name AS nameCategory,
    Merchant.name AS nameMerchant
  FROM Transaction 
  LEFT JOIN Card ON Card.idCard = Transaction.idCard
  LEFT JOIN Category ON Category.idCategory = Transaction.idCategory
  LEFT JOIN Merchant ON Merchant.idMerchant = Transaction.idMerchant`;
  sqlString.push('Card.number = ?');
  sqlParams.push(number);
  sqlString.push('Card.pin = ?');
  sqlParams.push(pin);
  if (isDefinedAndNotEmpty(start)) {
    sqlString.push('Transaction.createdAt >= ?');
    sqlParams.push(start);
  }
  if (isDefinedAndNotEmpty(end)) {
    sqlString.push('Transaction.createdAt <= ?');
    sqlParams.push(end);
  }
  sqlQuery = `${sqlQuery} WHERE ${sqlString.join(' AND ')} ORDER BY Transaction.createdAt ASC`;

  return Promise.all([
    session.executeSql(`USE ${config.dbConfig.database}`).execute(),
    session.executeSql(sqlQuery, sqlParams).execute((row) => {
      const obj = Transaction.fromRow(row);
      if (obj.type === 'D') {
        obj.type = 'Deposit';
      } else {
        obj.type = 'Payment';
      }
      delete obj.idCard;
      rows[0].push(obj);
    }),
    session.executeSql(sqlQueryCount).execute((row) => {
      rows[1].push(row);
    }),
  ])
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
  getTransactionsByNumberAndPin,
};
