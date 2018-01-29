const { isDefinedAndNotEmpty, isNumber } = require('check-tool');
const utils = require('server/utils');
const connector = require('server/db/connector');
const dbMerchant = require('server/db/Merchant');
const Merchant = require('server/bean/Merchant');

const register = async (req, res) => {
  // check if we have required parameters
  const name = isDefinedAndNotEmpty(req.body.name) ? req.body.name : null;
  if (name == null) {
    utils.returnJson(res, utils.getResultObjectErrorInvalidParameter('name'));
    return;
  }
  const idCategory = isNumber(req.body.idCategory) ? req.body.idCategory : null;
  if (idCategory == null) {
    utils.returnJson(res, utils.getResultObjectErrorInvalidParameter('idCategory'));
    return;
  }

  const session = await connector.getSession();

  dbMerchant
    .create(
      session,
      idCategory,
      name,
    )
    .then((result) => {
      session.close();
      const data = result.data;
      const resultObject = utils.getResultObject();
      const resultMerchant = Merchant.fromRow(data);
      resultObject.data = [resultMerchant];
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
  register,
};
