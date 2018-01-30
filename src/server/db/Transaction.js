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
      Transaction.idMerchant,
      Merchant.name AS nameMerchant,
      Merchant.idCategory,
      Category.name AS nameCategory
    FROM Transaction 
    LEFT JOIN Card ON Card.idCard = Transaction.idCard
    LEFT JOIN Merchant ON Merchant.idMerchant = Transaction.idMerchant
    LEFT JOIN Category ON Category.idCategory = Merchant.idCategory`;
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
      delete obj.idCategory;
      rows[0].push(obj);
    }),
    session.executeSql(sqlQueryCount).execute((row) => {
      rows[1] = row;
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

const authorize = (session, idCard, idMerchant, amount) => {
  const rows = [];

  return session
    .executeSql(
      `CALL ${config.dbConfig.database}.TransactionAuthorize(?, ?, ?)`,
      idCard,
      idMerchant,
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
      result.meta.errorMessage = 'Error authorizing transaction';
      result.data = null;
      logger.error('Error authorizing transaction', err);
      return result;
    });
};

const capture = (session, idTransaction, idMerchant, amount) => {
  const rows = [];

  return session
    .executeSql(
      `CALL ${config.dbConfig.database}.TransactionCapture(?, ?, ?)`,
      idTransaction,
      idMerchant,
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
      result.meta.errorMessage = 'Error authorizing transaction';
      result.data = null;
      logger.error('Error authorizing transaction', err);
      return result;
    });
};

const reverse = (session, idTransaction, idMerchant, amount) => {
  const rows = [];

  return session
    .executeSql(
      `CALL ${config.dbConfig.database}.TransactionReverse(?, ?, ?)`,
      idTransaction,
      idMerchant,
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
      result.meta.errorMessage = 'Error authorizing transaction';
      result.data = null;
      logger.error('Error authorizing transaction', err);
      return result;
    });
};

const refund = (session, idTransaction, idMerchant, amount) => {
  const rows = [];

  return session
    .executeSql(
      `CALL ${config.dbConfig.database}.TransactionRefund(?, ?, ?)`,
      idTransaction,
      idMerchant,
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
      result.meta.errorMessage = 'Error authorizing transaction';
      result.data = null;
      logger.error('Error authorizing transaction', err);
      return result;
    });
};

module.exports = {
  getTransactionsByNumberAndPin,
  authorize,
  capture,
  reverse,
  refund,
};
