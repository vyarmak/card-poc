const { isDefinedAndNotEmpty } = require('check-tool');
const utils = require('server/utils');
const connector = require('server/db/connector');
const db = require('server/db/Transaction');
const Transaction = require('server/bean/Transaction');

const getTransactionsByNumberAndPin = async (req, res) => {
  const number = isDefinedAndNotEmpty(req.body.number) ? req.body.number : null;
  if (number == null) {
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

module.exports = {
  getTransactionsByNumberAndPin,
};
