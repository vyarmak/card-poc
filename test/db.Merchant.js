const assert = require('assert');

const connector = require('server/db/connector');
const dbMerchant = require('server/db/Merchant');
const Merchant = require('server/bean/Merchant');

describe('DB Merchant', () => {
  describe('create merchant', () => {
    let idMerchant = null;
    it('should create merchant', async () => {
      const session = await connector.getSession();
      dbMerchant.create(session, 1, 'Test Merchant').then((result) => {
        session.close();
        const data = result.data;
        const resultMerchant = Merchant.fromRow(data);
        idMerchant = resultMerchant.idMerchant;
        assert.notEqual(idMerchant, null);
      });
    });
  });
});
