const connector = require('server/db/connector');
const db = require('server/db/Category');
const utils = require('server/utils');

const getAll = async (req, res) => {
  const session = await connector.getSession();

  db
    .findAll(session)
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
  getAll,
};
