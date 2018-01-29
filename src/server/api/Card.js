const { isDefinedAndNotEmpty, isNumber } = require('check-tool');
const utils = require('server/utils');
const connector = require('server/db/connector');
const db = require('server/db/Card');
const Card = require('server/bean/Card');

/**
 * Endpoint to create a new card
 * @param {Object} req HTTP Request
 * @param {Object} res HTTP Response
 */
const create = async (req, res) => {
  // check if we have required parameters
  const name = isDefinedAndNotEmpty(req.body.name) ? req.body.name : null;
  if (name == null) {
    utils.returnJson(res, utils.getResultObjectErrorInvalidParameter('name'));
    return;
  }

  // generate PIN
  const pin = utils.generatePIN();
  const session = await connector.getSession();

  db
    .create(
      session,
      utils.generateCardNumber(),
      name,
      utils.newIssuedDate(),
      utils.newExpiryDate(),
      utils.generateCVV(),
      utils.sha256(pin),
    )
    .then((result) => {
      session.close();
      const data = result.data;
      const resultObject = utils.getResultObject();
      const resultCard = Card.fromRow(data);
      resultCard.pin = pin;
      resultObject.data = [resultCard];
      resultObject.meta = result.meta;
      utils.returnJson(res, resultObject);
    })
    .catch((error) => {
      session.close();
      console.log('error', error);
      utils.returnJson(res, utils.getResultObjectError('Error', error));
    });
};

const deposit = async (req, res) => {
  const number = isDefinedAndNotEmpty(req.body.number) ? req.body.number : null;
  if (number == null) {
    utils.returnJson(res, utils.getResultObjectErrorInvalidParameter('number'));
    return;
  }
  const amount = isNumber(req.body.amount) ? parseFloat(req.body.amount) : null;
  if (amount == null) {
    utils.returnJson(res, utils.getResultObjectErrorInvalidParameter('amount'));
    return;
  }

  const session = await connector.getSession();

  db
    .deposit(session, number, amount)
    .then((result) => {
      session.close();
      const data = result.data;
      const resultObject = utils.getResultObject();
      resultObject.data = [Card.fromRow(data)];
      resultObject.meta = result.meta;
      utils.returnJson(res, resultObject);
    })
    .catch((error) => {
      session.close();
      console.log('error', error);
      utils.returnJson(res, utils.getResultObjectError('Error', error));
    });
};

const notImplemented = (req, res) => {
  utils.returnJson(
    res,
    utils.getResultObjectError('NotImplemented', 'Method not implemented'),
    501,
  );
};

module.exports = {
  create,
  deposit,
  balance: notImplemented,
  transactions: notImplemented,
  authorize: notImplemented,
  capture: notImplemented,
  reverse: notImplemented,
  refund: notImplemented,
};
