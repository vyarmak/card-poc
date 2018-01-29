const { isDefinedAndNotEmpty, isNumber } = require('check-tool');
const utils = require('server/utils');
const connector = require('server/db/connector');
const db = require('server/db/Transaction');
const dbCard = require('server/db/Card');
const Transaction = require('server/bean/Transaction');
const Card = require('server/bean/Card');

const getTransactionsByNumberAndPin = async (req, res) => {
  const number = isDefinedAndNotEmpty(req.body.number) ? req.body.number : null;
  if (number == null || !utils.isValidCardNumber(number)) {
    utils.returnJson(res, utils.getResultObjectErrorInvalidParameter('number'));
    return;
  }
  const pin = isDefinedAndNotEmpty(req.body.pin) ? req.body.pin : null;
  if (pin == null) {
    utils.returnJson(res, utils.getResultObjectErrorInvalidParameter('pin'));
    return;
  }
  const start = isDefinedAndNotEmpty(req.body.start) ? req.body.start : null;
  const end = isDefinedAndNotEmpty(req.body.end) ? req.body.end : null;

  const session = await connector.getSession();

  db
    .getTransactionsByNumberAndPin(session, number, utils.sha256(pin), start, end)
    .then((result) => {
      session.close();
      utils.returnJson(res, result);
    })
    .catch((error) => {
      session.close();
      console.log('error', error);
      utils.returnJson(res, utils.getResultObjectError('Error', error));
    });
};

const authorize = async (req, res) => {
  const number = isDefinedAndNotEmpty(req.body.number) ? req.body.number : null;
  if (number == null || !utils.isValidCardNumber(number)) {
    utils.returnJson(res, utils.getResultObjectErrorInvalidParameter('number'));
    return;
  }
  const name = isDefinedAndNotEmpty(req.body.name) ? req.body.name : null;
  if (name == null) {
    utils.returnJson(res, utils.getResultObjectErrorInvalidParameter('name'));
    return;
  }
  const expiryDate = isDefinedAndNotEmpty(req.body.expiryDate) ? req.body.expiryDate : null;
  if (expiryDate == null) {
    utils.returnJson(res, utils.getResultObjectErrorInvalidParameter('expiryDate'));
    return;
  }
  const cvv = isDefinedAndNotEmpty(req.body.cvv) ? req.body.cvv : null;
  if (cvv == null) {
    utils.returnJson(res, utils.getResultObjectErrorInvalidParameter('cvv'));
    return;
  }
  const pin = isDefinedAndNotEmpty(req.body.pin) ? req.body.pin : null;
  if (pin == null) {
    utils.returnJson(res, utils.getResultObjectErrorInvalidParameter('pin'));
    return;
  }
  const amount = isNumber(req.body.amount) ? parseFloat(req.body.amount) : null;
  if (amount == null) {
    utils.returnJson(res, utils.getResultObjectErrorInvalidParameter('amount'));
    return;
  }
  const idMerchant = isNumber(req.body.idMerchant) ? parseFloat(req.body.idMerchant) : null;
  if (idMerchant == null) {
    utils.returnJson(res, utils.getResultObjectErrorInvalidParameter('idMerchant'));
    return;
  }

  const session = await connector.getSession();

  const cardResult = await dbCard.validate(
    session,
    number,
    name,
    expiryDate,
    cvv,
    utils.sha256(pin),
  );
  const card = Card.fromRow(cardResult.data);

  if (!isDefinedAndNotEmpty(card.idCard)) {
    utils.returnJson(res, utils.getResultObjectError('InvalidCard', 'Invalid card data'));
    return;
  }

  db
    .authorize(session, card.idCard, idMerchant, amount)
    .then((result) => {
      session.close();
      const data = result.data;
      const resultObject = utils.getResultObject();
      resultObject.data = [Transaction.fromRow(data)];
      resultObject.meta = result.meta;
      utils.returnJson(res, resultObject);
    })
    .catch((error) => {
      session.close();
      console.log('error', error);
      utils.returnJson(res, utils.getResultObjectError('Error', error));
    });
};

const capture = async (req, res) => {
  const idTransaction = isNumber(req.body.idTransaction) ? req.body.idTransaction : null;
  if (idTransaction == null) {
    utils.returnJson(res, utils.getResultObjectErrorInvalidParameter('idTransaction'));
    return;
  }
  const amount = isNumber(req.body.amount) ? parseFloat(req.body.amount) : null;
  if (amount == null) {
    utils.returnJson(res, utils.getResultObjectErrorInvalidParameter('amount'));
    return;
  }
  const idMerchant = isNumber(req.body.idMerchant) ? parseFloat(req.body.idMerchant) : null;
  if (idMerchant == null) {
    utils.returnJson(res, utils.getResultObjectErrorInvalidParameter('idMerchant'));
    return;
  }

  const session = await connector.getSession();

  db
    .capture(session, idTransaction, idMerchant, amount)
    .then((result) => {
      session.close();
      const data = result.data;
      const resultObject = utils.getResultObject();
      resultObject.data = [Transaction.fromRow(data)];
      resultObject.meta = result.meta;
      utils.returnJson(res, resultObject);
    })
    .catch((error) => {
      session.close();
      console.log('error', error);
      utils.returnJson(res, utils.getResultObjectError('Error', error));
    });
};

const reverse = async (req, res) => {
  const idTransaction = isNumber(req.body.idTransaction) ? req.body.idTransaction : null;
  if (idTransaction == null) {
    utils.returnJson(res, utils.getResultObjectErrorInvalidParameter('idTransaction'));
    return;
  }
  const amount = isNumber(req.body.amount) ? parseFloat(req.body.amount) : null;
  if (amount == null) {
    utils.returnJson(res, utils.getResultObjectErrorInvalidParameter('amount'));
    return;
  }
  const idMerchant = isNumber(req.body.idMerchant) ? parseFloat(req.body.idMerchant) : null;
  if (idMerchant == null) {
    utils.returnJson(res, utils.getResultObjectErrorInvalidParameter('idMerchant'));
    return;
  }

  const session = await connector.getSession();

  db
    .reverse(session, idTransaction, idMerchant, amount)
    .then((result) => {
      session.close();
      const data = result.data;
      const resultObject = utils.getResultObject();
      resultObject.data = [Transaction.fromRow(data)];
      resultObject.meta = result.meta;
      utils.returnJson(res, resultObject);
    })
    .catch((error) => {
      session.close();
      console.log('error', error);
      utils.returnJson(res, utils.getResultObjectError('Error', error));
    });
};

const refund = async (req, res) => {
  const idTransaction = isNumber(req.body.idTransaction) ? req.body.idTransaction : null;
  if (idTransaction == null) {
    utils.returnJson(res, utils.getResultObjectErrorInvalidParameter('idTransaction'));
    return;
  }
  const amount = isNumber(req.body.amount) ? parseFloat(req.body.amount) : null;
  if (amount == null) {
    utils.returnJson(res, utils.getResultObjectErrorInvalidParameter('amount'));
    return;
  }
  const idMerchant = isNumber(req.body.idMerchant) ? parseFloat(req.body.idMerchant) : null;
  if (idMerchant == null) {
    utils.returnJson(res, utils.getResultObjectErrorInvalidParameter('idMerchant'));
    return;
  }

  const session = await connector.getSession();

  db
    .refund(session, idTransaction, idMerchant, amount)
    .then((result) => {
      session.close();
      const data = result.data;
      const resultObject = utils.getResultObject();
      resultObject.data = [Transaction.fromRow(data)];
      resultObject.meta = result.meta;
      utils.returnJson(res, resultObject);
    })
    .catch((error) => {
      session.close();
      console.log('error', error);
      utils.returnJson(res, utils.getResultObjectError('Error', error));
    });
};

module.exports = {
  getTransactionsByNumberAndPin,
  authorize,
  capture,
  reverse,
  refund,
};
