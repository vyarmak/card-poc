const assert = require('assert');
const connector = require('server/db/connector');

describe('DB Connection', () => {
  describe('get session', () => {
    it('should get session', async () => {
      const session = await connector.getSession();
      assert.notEqual(session, null);
      session.close();
    });
    it('should get schema', async () => {
      const session = await connector.getSession();
      const schema = connector.getSchema(session);
      assert.notEqual(schema, null);
      session.close();
    });
  });
});

