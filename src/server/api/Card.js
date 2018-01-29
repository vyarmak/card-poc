const { isDefinedAndNotEmpty, isNumber } = require('check-tool');
const utils = require('server/utils');
const connector = require('server/db/connector');
const dbCard = require('server/db/Card');
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
  const cvv = utils.generateCVV();
  const session = await connector.getSession();

  dbCard
    .create(
      session,
      utils.generateCardNumber(),
      name,
      utils.newIssuedDate(),
      utils.newExpiryDate(),
      cvv,
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
  if (number == null || !utils.isValidCardNumber(number)) {
    utils.returnJson(res, utils.getResultObjectErrorInvalidParameter('number'));
    return;
  }
  const amount = isNumber(req.body.amount) ? parseFloat(req.body.amount) : null;
  if (amount == null) {
    utils.returnJson(res, utils.getResultObjectErrorInvalidParameter('amount'));
    return;
  }

  const session = await connector.getSession();

  dbCard
    .deposit(session, number, amount)
    .then((result) => {
      session.close();
      const data = result.data;
      const resultObject = utils.getResultObject();
      resultObject.data = [Card.fromRow(data).forClient()];
      resultObject.meta = result.meta;
      utils.returnJson(res, resultObject);
    })
    .catch((error) => {
      session.close();
      console.log('error', error);
      utils.returnJson(res, utils.getResultObjectError('Error', error));
    });
};

const balance = async (req, res) => {
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

  const session = await connector.getSession();

  dbCard
    .getByNumberAndPin(session, number, utils.sha256(pin))
    .then((result) => {
      session.close();
      const data = result.data;
      const resultObject = utils.getResultObject();
      resultObject.data = [Card.fromRow(data).forClient()];
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
  create,
  deposit,
  balance,
};
