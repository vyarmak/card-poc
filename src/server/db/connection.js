import mysql from 'mysql';
import config from 'server/config';
import { isDefinedAndNotNull, isDefinedAndNotEmpty, isObject, isNumber } from 'check-tool';
import { debug } from 'server/logger';
import { getResultObject } from 'server/utils';

const SQL_QUERY_COUNT = 'SELECT FOUND_ROWS() AS totalRecords, "" AS errCode, "" AS errMessage';
const SORT_DIRECTIONS = ['asc', 'desc'];

/**
 * Create a database pool
 */
const db = mysql.createPool(config.dbConfig);

/**
 * Process database resultset and create result object
 * @param {any} err error from db query
 * @param {any} resultset resultset from db query
 * @returns result object
 */
const processSelectResultset = (err, resultset) => {
  const result = getResultObject();
  if (isDefinedAndNotEmpty(err)) {
    debug('processResultset.err', err);
    result.meta = {
      errorCode: isDefinedAndNotNull(err.code) ? err.code : 'UNKNOWN_ERROR',
      errorMessage: JSON.stringify(err),
    };
  } else {
    result.data = resultset[0];
    // if (isDefinedAndNotNull(singleRow) && singleRow && result.data.length > 0) {
    //   result.data = result.data[0];
    // }
    result.meta.totalRecords = resultset[0].length;
    if (isDefinedAndNotNull(resultset[1]) && resultset[1].length === 1) {
      result.meta.totalRecords = resultset[1][0].totalRecords;
      if (isDefinedAndNotEmpty(resultset[1][0].errCode)) {
        result.meta = {
          errorCode: resultset[1][0].errCode,
          errorMessage: resultset[1][0].errMessage,
        };
      }
    }
  }
  return result;
};

/**
 * Process database resultset and create result object
 * @param {any} err error from db query
 * @param {any} resultset resultset from db query
 * @returns result object
 */
const processModifyResultset = (err) => {
  const result = getResultObject();
  if (isDefinedAndNotEmpty(err)) {
    debug('processResultset.err', err);
    result.meta = {
      errorCode: isDefinedAndNotNull(err.code) ? err.code : 'UNKNOWN_ERROR',
      errorMessage: JSON.stringify(err.mesage),
    };
  }
  return result;
};

/**
 * Prepare LIKE parameter to a '%XYC%' form
 * @param {String} parameter to be converted to SQL LIKE format
 * @returns {String} SQL LIKE string
 */
const prepareLikeParameter = (parameter) => {
  const result = parameter != null && parameter ? `%${parameter}%` : null;
  return result;
};

/**
 * Prepare LIKE parameter to a 'XYC%' form
 * @param {String} parameter to be converted to SQL LIKE format
 * @returns {String} SQL LIKE string
 */
const prepareLikeRightParameter = (parameter) => {
  const result = parameter != null && parameter ? `${parameter}%` : null;
  return result;
};

const normalizePageParameter = (parameters) => {
  let result = {
    page: 0,
    records: 10,
  };
  if (isObject(parameters.page)) {
    result = parameters.page;
    if (!isNumber(result.page)) {
      result.page = 0;
    }
    if (!isNumber(result.records)) {
      result.records = 10;
    }
  }
  return result;
};

/**
 * Check if specified field is in the list of field
 * @param {Array} sqlFields list of SQL fields
 * @param {String} field specified field
 * @returns {Number} field index
 */
const findFieldInSqlFields = (sqlFields, field) =>
  sqlFields.findIndex((key) => key.endsWith(`.${field}`) || key === field);

/**
 * Normalize sorting parameters
 * @param {Object} parameters parameters object
 * @param {Array} sqlFields list of SQL fields
 * @param {Object} defaultSort default sort object
 * @returns {Object} normalized sort parameter
 */
const normalizeSortParameter = (parameters, sqlFields, defaultSort) => {
  let result = defaultSort;
  if (isDefinedAndNotEmpty(parameters.sort)) {
    result = parameters.sort;
    const fieldIndex = findFieldInSqlFields(sqlFields, result.field);
    if (!isDefinedAndNotEmpty(result.field) || fieldIndex === -1) {
      result.field = defaultSort.field;
    } else {
      result.field = sqlFields[fieldIndex];
    }
    if (
      !isDefinedAndNotEmpty(result.direction) ||
      SORT_DIRECTIONS.indexOf(`${result.direction}`.toLowerCase()) === -1
    ) {
      result.direction = defaultSort.direction;
    }
  }
  result.direction = result.direction.toUpperCase();
  return result;
};

export {
  SQL_QUERY_COUNT,
  db,
  getResultObject,
  processSelectResultset,
  processModifyResultset,
  prepareLikeParameter,
  prepareLikeRightParameter,
  normalizePageParameter,
  normalizeSortParameter,
};
