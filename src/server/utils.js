const crypto = require('crypto');
const { isDefinedAndNotNull, isDefined, isNumber } = require('check-tool');

const { error } = require('server/logger');
const config = require('server/config');

/**
 * Create a common result object
 * @return {Object} common result object
 */
const getResultObject = () => ({
  data: null,
  meta: {
    errorCode: '',
    errorMessage: '',
    count: 0,
  },
});

/**
 * Get result object with specified error code and error message
 * @param {String} errorCode error code
 * @param {string} errorMessage error message
 */
const getResultObjectError = (errorCode, errorMessage) => {
  const result = getResultObject();
  result.meta.errorCode = errorCode;
  result.meta.errorMessage = errorMessage;
  return result;
};

/**
 * Get a common result object with invalid parameter error message
 * @param  {String} parameterName parameter name
 * @return {Object}               common result object
 */
const getResultObjectErrorInvalidParameter = (parameterName) => {
  error(`Invalid parameter ${parameterName}`);
  return getResultObjectError('INVALID_PARAM', `Invalid parameter ${parameterName}`);
};

/**
 * Set response headers to disable caching
 * @param {Object} res HTTP response
 */
const setNoCacheHeaders = (res) => {
  res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.header('Pragma', 'no-cache');
  res.header('Expires', 0);
};

/**
 * Return standard JSON result
 * @param {Object} res HTTP response
 * @param {Object} result result JSON object
 * @param {Number} httpStatus HTTP status
 */
const returnJson = (res, result, httpStatus) => {
  let finalHttpStatus = 200;
  let finalResult = {
    ...result,
  };
  if (!isDefinedAndNotNull(result.meta) || !isDefined(result.data)) {
    error('Invalid result object recieved', result);
    finalResult = Object.assign({}, getResultObject(), {
      meta: {
        errorCode: 'INVALID_RESULT_OBJECT',
        errorMessage: 'Invalid result object',
      },
    });
  }
  /** check if errorCode is defined */
  if (result.meta.errorCode !== undefined && result.meta.errorCode) {
    /** @type {Number} set error HTTP  */
    finalHttpStatus = isNumber(httpStatus) ? httpStatus : 500;
  }
  setNoCacheHeaders(res);
  res.status(finalHttpStatus).jsonp({
    meta: finalResult.meta,
    data: finalResult.data,
  });
  res.end();
};

const mastercardPrefixList = ['51', '52', '53', '54', '55'];

const completeCardNumber = (prefix, length) => {
  let cardNumber = prefix;

  // generate digits
  while (cardNumber.length < length - 1) {
    cardNumber += Math.floor(Math.random() * 10);
  }

  // reverse number and convert to int
  const reversedCardNumberString = cardNumber
    .split('')
    .reverse()
    .join('');
  const reversedCardNumber = [];
  for (let i = 0; i < reversedCardNumberString.length; i += 1) {
    reversedCardNumber.push(parseInt(reversedCardNumberString.charAt(i), 10));
  }

  // calculate sum
  let sum = 0;
  let pos = 0;

  while (pos < length - 1) {
    let odd = reversedCardNumber[pos] * 2;
    if (odd > 9) {
      odd -= 9;
    }

    sum += odd;

    if (pos !== length - 2) {
      sum += reversedCardNumber[pos + 1];
    }
    pos += 2;
  }

  // calculate check digit
  // eslint-disable-next-line
  cardNumber += ((Math.floor(sum / 10) + 1) * 10 - sum) % 10;

  return cardNumber;
};

/**
 * Generate a credit card number
 */
const generateCardNumber = () => {
  const randomArrayIndex = Math.floor(Math.random() * mastercardPrefixList.length);
  const cardNumber = mastercardPrefixList[randomArrayIndex];
  return completeCardNumber(cardNumber, 16);
};

const luhnCheck = (val) => {
  let sum = 0;
  for (let i = 0; i < val.length; i += 1) {
    let intVal = parseInt(val.substr(i, 1), 10);
    if (i % 2 === 0) {
      intVal *= 2;
      if (intVal > 9) {
        intVal = 1 + intVal % 10; // eslint-disable-line
      }
    }
    sum += intVal;
  }
  return sum % 10 === 0;
};

/**
 * Check if a valid credit card number
 * @param {String} number card number
 */
const isValidCardNumber = (number) => {
  const regex = new RegExp('^[0-9]{16}$');
  if (!regex.test(number)) {
    return false;
  }
  return luhnCheck(number);
};

const sha256 = (password) => {
  const hash = crypto.createHmac('sha256', config.salt);
  hash.update(password);
  return hash.digest('hex');
};

const generateCVV = () => `${Math.round(Math.random() * 999)}`.padStart(3, '0');
const generatePIN = () => `${Math.round(Math.random() * 9999)}`.padStart(4, '0');

const newIssuedDate = () => new Date();
const newExpiryDate = () =>
  new Date(new Date().setFullYear(new Date().getFullYear() + config.cardValidityYears));

const toMySQLDate = (date) => date.toISOString().slice(0, 19).replace('T', ' ');

module.exports = {
  getResultObject,
  returnJson,
  getResultObjectError,
  getResultObjectErrorInvalidParameter,
  generateCardNumber,
  isValidCardNumber,
  sha256,
  generateCVV,
  generatePIN,
  newIssuedDate,
  newExpiryDate,
  toMySQLDate,
};
