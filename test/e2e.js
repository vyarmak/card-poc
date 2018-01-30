process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('server/index');
const connector = require('server/db/connector');
const config = require('server/config');

const expect = chai.expect;
chai.use(chaiHttp);

let createdMerchant = null;
let createdCard = null;
let createdTransaction = null;

const merchant = {
  idCategory: 22,
  name: 'Starbucks',
};

const card = {
  name: 'John Doe',
};
describe('End to end testing', () => {
  before(async () => {
    const session = await connector.getSession();
    return Promise.all([
      session.executeSql(`USE ${config.dbConfig.database}`).execute(),
      session.executeSql('SET FOREIGN_KEY_CHECKS=0').execute(),
      session.executeSql('TRUNCATE TABLE Merchant').execute(),
      session.executeSql('TRUNCATE TABLE Card').execute(),
      session.executeSql('TRUNCATE TABLE Transaction').execute(),
      session.executeSql('TRUNCATE TABLE TransactionLedger').execute(),
      session.executeSql('SET FOREIGN_KEY_CHECKS=1').execute(),
    ]);
  });

  describe('Categories', () => {
    it('it should get all categories', (done) => {
      chai
        .request(server)
        .get('/api/1.0/categories')
        .end((err, res) => {
          expect(res, 'invalid HTTP status').to.have.status(200);
          expect(res.body, 'body is not an object').to.be.a('object');
          expect(res.body, 'body don\'t have *data* property').to.have.property('data');
          expect(res.body, 'body don\'t have *meta* property').to.have.property('meta');
          expect(res.body.data, 'body.data is not an array').to.be.a('array');
          expect(res.body.data.length).to.be.eql(42);
          done();
        });
    });
  });

  describe('Merchant', () => {
    it('it should create a merchant', (done) => {
      chai
        .request(server)
        .post('/api/1.0/merchant')
        .send(merchant)
        .end((err, res) => {
          expect(res, 'invalid HTTP status').to.have.status(200);
          expect(res.body, 'body is not an object').to.be.a('object');
          expect(res.body, 'body don\'t have *data* property').to.have.property('data');
          expect(res.body, 'body don\'t have *meta* property').to.have.property('meta');
          expect(res.body.data, 'body.data is not an array').to.be.a('array');
          expect(res.body.data.length, 'body.data length is not 1').to.be.eql(1);
          createdMerchant = res.body.data[0];
          done();
        });
    });
  });

  describe('Card', () => {
    it('it should create a card', (done) => {
      chai
        .request(server)
        .post('/api/1.0/card')
        .send(card)
        .end((err, res) => {
          expect(res, 'invalid HTTP status').to.have.status(200);
          expect(res.body, 'body is not an object').to.be.a('object');
          expect(res.body, 'body don\'t have *data* property').to.have.property('data');
          expect(res.body, 'body don\'t have *meta* property').to.have.property('meta');
          expect(res.body.data, 'body.data is not an array').to.be.a('array');
          expect(res.body.data.length, 'body.data length is not 1').to.be.eql(1);
          createdCard = res.body.data[0];
          done();
        });
    });
    it('it should deposit money to card', (done) => {
      chai
        .request(server)
        .post('/api/1.0/card/deposit')
        .send({
          number: createdCard.number,
          amount: 200.2,
        })
        .end((err, res) => {
          expect(res, 'invalid HTTP status').to.have.status(200);
          expect(res.body, 'body is not an object').to.be.a('object');
          expect(res.body, 'body don\'t have *data* property').to.have.property('data');
          expect(res.body, 'body don\'t have *meta* property').to.have.property('meta');
          expect(res.body.data, 'body.data is not an array').to.be.a('array');
          expect(res.body.data.length, 'body.data length is not 1').to.be.eql(1);
          const cardInfo = res.body.data[0];
          expect(cardInfo.balance, 'incorrect balance').to.be.eql('200.20');
          done();
        });
    });
    it('it should get correct balance', (done) => {
      chai
        .request(server)
        .post('/api/1.0/card/balance')
        .send({
          number: createdCard.number,
          pin: createdCard.pin,
        })
        .end((err, res) => {
          expect(res, 'invalid HTTP status').to.have.status(200);
          expect(res.body, 'body is not an object').to.be.a('object');
          expect(res.body, 'body don\'t have *data* property').to.have.property('data');
          expect(res.body, 'body don\'t have *meta* property').to.have.property('meta');
          expect(res.body.data, 'body.data is not an array').to.be.a('array');
          expect(res.body.data.length, 'body.data length is not 1').to.be.eql(1);
          const cardInfo = res.body.data[0];
          expect(cardInfo.balance, 'incorrect balance').to.be.eql('200.20');
          expect(cardInfo.balanceBlocked, 'incorrect balanceBlocked').to.be.eql('0.00');
          done();
        });
    });
  });

  describe('Transactions - success scenario', () => {
    it('it should make authorization request', (done) => {
      chai
        .request(server)
        .post('/api/1.0/transaction/authorize')
        .send({
          number: createdCard.number,
          name: createdCard.name,
          expiryDate: createdCard.expiryDate,
          cvv: createdCard.cvv,
          pin: createdCard.pin,
          idMerchant: createdMerchant.idMerchant,
          amount: 50.50,
        })
        .end((err, res) => {
          expect(res, 'invalid HTTP status').to.have.status(200);
          expect(res.body, 'body is not an object').to.be.a('object');
          expect(res.body, 'body don\'t have *data* property').to.have.property('data');
          expect(res.body, 'body don\'t have *meta* property').to.have.property('meta');
          expect(res.body.data, 'body.data is not an array').to.be.a('array');
          expect(res.body.data.length, 'body.data length is not 1').to.be.eql(1);
          createdTransaction = res.body.data[0];
          expect(createdTransaction.type, 'incorrect transaction type').to.be.eql('P');
          expect(createdTransaction.amount, 'incorrect amount').to.be.eql('50.50');
          expect(createdTransaction.amountCaptured, 'incorrect amountCaptured').to.be.eql('0.00');
          done();
        });
    });
    it('it should get correct balance after authorization request', (done) => {
      chai
        .request(server)
        .post('/api/1.0/card/balance')
        .send({
          number: createdCard.number,
          pin: createdCard.pin,
        })
        .end((err, res) => {
          expect(res, 'invalid HTTP status').to.have.status(200);
          expect(res.body, 'body is not an object').to.be.a('object');
          expect(res.body, 'body don\'t have *data* property').to.have.property('data');
          expect(res.body, 'body don\'t have *meta* property').to.have.property('meta');
          expect(res.body.data, 'body.data is not an array').to.be.a('array');
          expect(res.body.data.length, 'body.data length is not 1').to.be.eql(1);
          const cardInfo = res.body.data[0];
          expect(cardInfo.balance, 'incorrect balance').to.be.eql('200.20');
          expect(cardInfo.balanceBlocked, 'incorrect balanceBlocked').to.be.eql('50.50');
          done();
        });
    });
    it('it should make partial capture request', (done) => {
      chai
        .request(server)
        .post('/api/1.0/transaction/capture')
        .send({
          idTransaction: createdTransaction.idTransaction,
          idMerchant: createdMerchant.idMerchant,
          amount: 20.50,
        })
        .end((err, res) => {
          expect(res, 'invalid HTTP status').to.have.status(200);
          expect(res.body, 'body is not an object').to.be.a('object');
          expect(res.body, 'body don\'t have *data* property').to.have.property('data');
          expect(res.body, 'body don\'t have *meta* property').to.have.property('meta');
          expect(res.body.data, 'body.data is not an array').to.be.a('array');
          expect(res.body.data.length, 'body.data length is not 1').to.be.eql(1);
          createdTransaction = res.body.data[0];
          expect(createdTransaction.type, 'incorrect transaction type').to.be.eql('P');
          expect(createdTransaction.amount, 'incorrect amount').to.be.eql('50.50');
          expect(createdTransaction.amountCaptured, 'incorrect amountCaptured').to.be.eql('20.50');
          done();
        });
    });
    it('it should get correct balance after partial capture', (done) => {
      chai
        .request(server)
        .post('/api/1.0/card/balance')
        .send({
          number: createdCard.number,
          pin: createdCard.pin,
        })
        .end((err, res) => {
          expect(res, 'invalid HTTP status').to.have.status(200);
          expect(res.body, 'body is not an object').to.be.a('object');
          expect(res.body, 'body don\'t have *data* property').to.have.property('data');
          expect(res.body, 'body don\'t have *meta* property').to.have.property('meta');
          expect(res.body.data, 'body.data is not an array').to.be.a('array');
          expect(res.body.data.length, 'body.data length is not 1').to.be.eql(1);
          const cardInfo = res.body.data[0];
          expect(cardInfo.balance, 'incorrect balance').to.be.eql('179.70');
          expect(cardInfo.balanceBlocked, 'incorrect balanceBlocked').to.be.eql('30.00');
          done();
        });
    });
    it('it should make partial capture request', (done) => {
      chai
        .request(server)
        .post('/api/1.0/transaction/reverse')
        .send({
          idTransaction: createdTransaction.idTransaction,
          idMerchant: createdMerchant.idMerchant,
          amount: 10.00,
        })
        .end((err, res) => {
          expect(res, 'invalid HTTP status').to.have.status(200);
          expect(res.body, 'body is not an object').to.be.a('object');
          expect(res.body, 'body don\'t have *data* property').to.have.property('data');
          expect(res.body, 'body don\'t have *meta* property').to.have.property('meta');
          expect(res.body.data, 'body.data is not an array').to.be.a('array');
          expect(res.body.data.length, 'body.data length is not 1').to.be.eql(1);
          createdTransaction = res.body.data[0];
          expect(createdTransaction.type, 'incorrect transaction type').to.be.eql('P');
          expect(createdTransaction.amount, 'incorrect amount').to.be.eql('40.50');
          expect(createdTransaction.amountCaptured, 'incorrect amountCaptured').to.be.eql('20.50');
          done();
        });
    });
    it('it should get correct balance after reverse', (done) => {
      chai
        .request(server)
        .post('/api/1.0/card/balance')
        .send({
          number: createdCard.number,
          pin: createdCard.pin,
        })
        .end((err, res) => {
          expect(res, 'invalid HTTP status').to.have.status(200);
          expect(res.body, 'body is not an object').to.be.a('object');
          expect(res.body, 'body don\'t have *data* property').to.have.property('data');
          expect(res.body, 'body don\'t have *meta* property').to.have.property('meta');
          expect(res.body.data, 'body.data is not an array').to.be.a('array');
          expect(res.body.data.length, 'body.data length is not 1').to.be.eql(1);
          const cardInfo = res.body.data[0];
          expect(cardInfo.balance, 'incorrect balance').to.be.eql('179.70');
          expect(cardInfo.balanceBlocked, 'incorrect balanceBlocked').to.be.eql('20.00');
          done();
        });
    });
    it('it should make partial capture request (total amount resting)', (done) => {
      chai
        .request(server)
        .post('/api/1.0/transaction/capture')
        .send({
          idTransaction: createdTransaction.idTransaction,
          idMerchant: createdMerchant.idMerchant,
          amount: 20.00,
        })
        .end((err, res) => {
          expect(res, 'invalid HTTP status').to.have.status(200);
          expect(res.body, 'body is not an object').to.be.a('object');
          expect(res.body, 'body don\'t have *data* property').to.have.property('data');
          expect(res.body, 'body don\'t have *meta* property').to.have.property('meta');
          expect(res.body.data, 'body.data is not an array').to.be.a('array');
          expect(res.body.data.length, 'body.data length is not 1').to.be.eql(1);
          createdTransaction = res.body.data[0];
          expect(createdTransaction.type, 'incorrect transaction type').to.be.eql('P');
          expect(createdTransaction.amount, 'incorrect amount').to.be.eql('40.50');
          expect(createdTransaction.amountCaptured, 'incorrect amountCaptured').to.be.eql('40.50');
          done();
        });
    });
    it('it should get correct balance after full capture', (done) => {
      chai
        .request(server)
        .post('/api/1.0/card/balance')
        .send({
          number: createdCard.number,
          pin: createdCard.pin,
        })
        .end((err, res) => {
          expect(res, 'invalid HTTP status').to.have.status(200);
          expect(res.body, 'body is not an object').to.be.a('object');
          expect(res.body, 'body don\'t have *data* property').to.have.property('data');
          expect(res.body, 'body don\'t have *meta* property').to.have.property('meta');
          expect(res.body.data, 'body.data is not an array').to.be.a('array');
          expect(res.body.data.length, 'body.data length is not 1').to.be.eql(1);
          const cardInfo = res.body.data[0];
          expect(cardInfo.balance, 'incorrect balance').to.be.eql('159.70');
          expect(cardInfo.balanceBlocked, 'incorrect balanceBlocked').to.be.eql('0.00');
          done();
        });
    });
    it('it should make refund request', (done) => {
      chai
        .request(server)
        .post('/api/1.0/transaction/refund')
        .send({
          idTransaction: createdTransaction.idTransaction,
          idMerchant: createdMerchant.idMerchant,
          amount: 10.00,
        })
        .end((err, res) => {
          expect(res, 'invalid HTTP status').to.have.status(200);
          expect(res.body, 'body is not an object').to.be.a('object');
          expect(res.body, 'body don\'t have *data* property').to.have.property('data');
          expect(res.body, 'body don\'t have *meta* property').to.have.property('meta');
          expect(res.body.data, 'body.data is not an array').to.be.a('array');
          expect(res.body.data.length, 'body.data length is not 1').to.be.eql(1);
          createdTransaction = res.body.data[0];
          expect(createdTransaction.type, 'incorrect transaction type').to.be.eql('P');
          expect(createdTransaction.amount, 'incorrect amount').to.be.eql('30.50');
          expect(createdTransaction.amountCaptured, 'incorrect amountCaptured').to.be.eql('30.50');
          done();
        });
    });
    it('it should get correct balance after refund', (done) => {
      chai
        .request(server)
        .post('/api/1.0/card/balance')
        .send({
          number: createdCard.number,
          pin: createdCard.pin,
        })
        .end((err, res) => {
          expect(res, 'invalid HTTP status').to.have.status(200);
          expect(res.body, 'body is not an object').to.be.a('object');
          expect(res.body, 'body don\'t have *data* property').to.have.property('data');
          expect(res.body, 'body don\'t have *meta* property').to.have.property('meta');
          expect(res.body.data, 'body.data is not an array').to.be.a('array');
          expect(res.body.data.length, 'body.data length is not 1').to.be.eql(1);
          const cardInfo = res.body.data[0];
          expect(cardInfo.balance, 'incorrect balance').to.be.eql('169.70');
          expect(cardInfo.balanceBlocked, 'incorrect balanceBlocked').to.be.eql('0.00');
          done();
        });
    });
  });

  describe('Transactions - errors scenario', () => {
    it('it should return InsuficientFunds', (done) => {
      chai
        .request(server)
        .post('/api/1.0/transaction/authorize')
        .send({
          number: createdCard.number,
          name: createdCard.name,
          expiryDate: createdCard.expiryDate,
          cvv: createdCard.cvv,
          pin: createdCard.pin,
          idMerchant: createdMerchant.idMerchant,
          amount: 300.50,
        })
        .end((err, res) => {
          expect(res, 'invalid HTTP status').to.have.status(500);
          expect(res.body, 'body is not an object').to.be.a('object');
          expect(res.body, 'body don\'t have *data* property').to.have.property('data');
          expect(res.body, 'body don\'t have *meta* property').to.have.property('meta');
          const transactionMeta = res.body.meta;
          expect(transactionMeta.errorCode, 'error code').to.be.eql('InsuficientFunds');
          expect(transactionMeta.errorMessage, 'error code').to.be.eql('Insuficient funds');
          done();
        });
    });
    it('it should return INVALID_PARAM', (done) => {
      chai
        .request(server)
        .post('/api/1.0/transaction/authorize')
        .send({
          number: 'FAKE CARD',
          name: createdCard.name,
          expiryDate: createdCard.expiryDate,
          cvv: createdCard.cvv,
          pin: createdCard.pin,
          idMerchant: createdMerchant.idMerchant,
          amount: 300.50,
        })
        .end((err, res) => {
          expect(res, 'invalid HTTP status').to.have.status(500);
          expect(res.body, 'body is not an object').to.be.a('object');
          expect(res.body, 'body don\'t have *data* property').to.have.property('data');
          expect(res.body, 'body don\'t have *meta* property').to.have.property('meta');
          const transactionMeta = res.body.meta;
          expect(transactionMeta.errorCode, 'error code').to.be.eql('INVALID_PARAM');
          expect(transactionMeta.errorMessage, 'error code').to.be.eql('Invalid parameter number');
          done();
        });
    });
    it('it should return InvalidCard', (done) => {
      chai
        .request(server)
        .post('/api/1.0/transaction/authorize')
        .send({
          number: createdCard.number,
          name: 'James Bond',
          expiryDate: createdCard.expiryDate,
          cvv: createdCard.cvv,
          pin: createdCard.pin,
          idMerchant: createdMerchant.idMerchant,
          amount: 300.50,
        })
        .end((err, res) => {
          expect(res, 'invalid HTTP status').to.have.status(500);
          expect(res.body, 'body is not an object').to.be.a('object');
          expect(res.body, 'body don\'t have *data* property').to.have.property('data');
          expect(res.body, 'body don\'t have *meta* property').to.have.property('meta');
          const transactionMeta = res.body.meta;
          expect(transactionMeta.errorCode, 'error code').to.be.eql('InvalidCard');
          expect(transactionMeta.errorMessage, 'error code').to.be.eql('Invalid card data');
          done();
        });
    });
    it('it should make authorization request', (done) => {
      chai
        .request(server)
        .post('/api/1.0/transaction/authorize')
        .send({
          number: createdCard.number,
          name: createdCard.name,
          expiryDate: createdCard.expiryDate,
          cvv: createdCard.cvv,
          pin: createdCard.pin,
          idMerchant: createdMerchant.idMerchant,
          amount: 50.50,
        })
        .end((err, res) => {
          expect(res, 'invalid HTTP status').to.have.status(200);
          expect(res.body, 'body is not an object').to.be.a('object');
          expect(res.body, 'body don\'t have *data* property').to.have.property('data');
          expect(res.body, 'body don\'t have *meta* property').to.have.property('meta');
          expect(res.body.data, 'body.data is not an array').to.be.a('array');
          expect(res.body.data.length, 'body.data length is not 1').to.be.eql(1);
          createdTransaction = res.body.data[0];
          expect(createdTransaction.type, 'incorrect transaction type').to.be.eql('P');
          expect(createdTransaction.amount, 'incorrect amount').to.be.eql('50.50');
          expect(createdTransaction.amountCaptured, 'incorrect amountCaptured').to.be.eql('0.00');
          done();
        });
    });
    it('it should get InvalidCard', (done) => {
      chai
        .request(server)
        .post('/api/1.0/card/balance')
        .send({
          number: createdCard.number,
          pin: '0000',
        })
        .end((err, res) => {
          expect(res, 'invalid HTTP status').to.have.status(500);
          expect(res.body, 'body is not an object').to.be.a('object');
          expect(res.body, 'body don\'t have *data* property').to.have.property('data');
          expect(res.body, 'body don\'t have *meta* property').to.have.property('meta');
          const transactionMeta = res.body.meta;
          expect(transactionMeta.errorCode, 'error code').to.be.eql('InvalidCard');
          expect(transactionMeta.errorMessage, 'error code').to.be.eql('Invalid card data');
          done();
        });
    });
    it('it should get correct balance after authorization request', (done) => {
      chai
        .request(server)
        .post('/api/1.0/card/balance')
        .send({
          number: createdCard.number,
          pin: createdCard.pin,
        })
        .end((err, res) => {
          expect(res, 'invalid HTTP status').to.have.status(200);
          expect(res.body, 'body is not an object').to.be.a('object');
          expect(res.body, 'body don\'t have *data* property').to.have.property('data');
          expect(res.body, 'body don\'t have *meta* property').to.have.property('meta');
          expect(res.body.data, 'body.data is not an array').to.be.a('array');
          expect(res.body.data.length, 'body.data length is not 1').to.be.eql(1);
          const cardInfo = res.body.data[0];
          expect(cardInfo.balance, 'incorrect balance').to.be.eql('169.70');
          expect(cardInfo.balanceBlocked, 'incorrect balanceBlocked').to.be.eql('50.50');
          done();
        });
    });
    it('it should get InvalidCaptureAmount (amount bigger than authorized)', (done) => {
      chai
        .request(server)
        .post('/api/1.0/transaction/capture')
        .send({
          idTransaction: createdTransaction.idTransaction,
          idMerchant: createdMerchant.idMerchant,
          amount: 100.50,
        })
        .end((err, res) => {
          expect(res, 'invalid HTTP status').to.have.status(500);
          expect(res.body, 'body is not an object').to.be.a('object');
          expect(res.body, 'body don\'t have *data* property').to.have.property('data');
          expect(res.body, 'body don\'t have *meta* property').to.have.property('meta');
          const transactionMeta = res.body.meta;
          expect(transactionMeta.errorCode, 'error code').to.be.eql('InvalidCaptureAmount');
          expect(transactionMeta.errorMessage, 'error code').to.be.eql('Invalid capture amount');
          done();
        });
    });
    it('it should get InvalidTransaction (invalid transaction id)', (done) => {
      chai
        .request(server)
        .post('/api/1.0/transaction/capture')
        .send({
          idTransaction: 123,
          idMerchant: createdMerchant.idMerchant,
          amount: 50.50,
        })
        .end((err, res) => {
          expect(res, 'invalid HTTP status').to.have.status(500);
          expect(res.body, 'body is not an object').to.be.a('object');
          expect(res.body, 'body don\'t have *data* property').to.have.property('data');
          expect(res.body, 'body don\'t have *meta* property').to.have.property('meta');
          const transactionMeta = res.body.meta;
          expect(transactionMeta.errorCode, 'error code').to.be.eql('InvalidTransaction');
          expect(transactionMeta.errorMessage, 'error code').to.be.eql('Invalid transaction ID');
          done();
        });
    });
    it('it should get InvalidTransaction (invalid merchant id)', (done) => {
      chai
        .request(server)
        .post('/api/1.0/transaction/capture')
        .send({
          idTransaction: createdTransaction.idTransaction,
          idMerchant: 123,
          amount: 50.50,
        })
        .end((err, res) => {
          expect(res, 'invalid HTTP status').to.have.status(500);
          expect(res.body, 'body is not an object').to.be.a('object');
          expect(res.body, 'body don\'t have *data* property').to.have.property('data');
          expect(res.body, 'body don\'t have *meta* property').to.have.property('meta');
          const transactionMeta = res.body.meta;
          expect(transactionMeta.errorCode, 'error code').to.be.eql('InvalidTransaction');
          expect(transactionMeta.errorMessage, 'error code').to.be.eql('Invalid transaction ID');
          done();
        });
    });
    it('it should make partial capture request', (done) => {
      chai
        .request(server)
        .post('/api/1.0/transaction/capture')
        .send({
          idTransaction: createdTransaction.idTransaction,
          idMerchant: createdMerchant.idMerchant,
          amount: 20.50,
        })
        .end((err, res) => {
          expect(res, 'invalid HTTP status').to.have.status(200);
          expect(res.body, 'body is not an object').to.be.a('object');
          expect(res.body, 'body don\'t have *data* property').to.have.property('data');
          expect(res.body, 'body don\'t have *meta* property').to.have.property('meta');
          expect(res.body.data, 'body.data is not an array').to.be.a('array');
          expect(res.body.data.length, 'body.data length is not 1').to.be.eql(1);
          createdTransaction = res.body.data[0];
          expect(createdTransaction.type, 'incorrect transaction type').to.be.eql('P');
          expect(createdTransaction.amount, 'incorrect amount').to.be.eql('50.50');
          expect(createdTransaction.amountCaptured, 'incorrect amountCaptured').to.be.eql('20.50');
          done();
        });
    });

    it('it should get InvalidCaptureAmount (more than left to capture)', (done) => {
      chai
        .request(server)
        .post('/api/1.0/transaction/capture')
        .send({
          idTransaction: createdTransaction.idTransaction,
          idMerchant: createdMerchant.idMerchant,
          amount: 30.50,
        })
        .end((err, res) => {
          expect(res, 'invalid HTTP status').to.have.status(500);
          expect(res.body, 'body is not an object').to.be.a('object');
          expect(res.body, 'body don\'t have *data* property').to.have.property('data');
          expect(res.body, 'body don\'t have *meta* property').to.have.property('meta');
          const transactionMeta = res.body.meta;
          expect(transactionMeta.errorCode, 'error code').to.be.eql('InvalidCaptureAmount');
          expect(transactionMeta.errorMessage, 'error code').to.be.eql('Invalid capture amount');
          done();
        });
    });
    it('it should InvalidReverseAmount (trying to reverse more than authorized)', (done) => {
      chai
        .request(server)
        .post('/api/1.0/transaction/reverse')
        .send({
          idTransaction: createdTransaction.idTransaction,
          idMerchant: createdMerchant.idMerchant,
          amount: 50.00,
        })
        .end((err, res) => {
          expect(res, 'invalid HTTP status').to.have.status(500);
          expect(res.body, 'body is not an object').to.be.a('object');
          expect(res.body, 'body don\'t have *data* property').to.have.property('data');
          expect(res.body, 'body don\'t have *meta* property').to.have.property('meta');
          const transactionMeta = res.body.meta;
          expect(transactionMeta.errorCode, 'error code').to.be.eql('InvalidReverseAmount');
          expect(transactionMeta.errorMessage, 'error code').to.be.eql('Invalid reverse amount');
          done();
        });
    });
    it('it should InvalidReverseAmount (trying to refund more than captured)', (done) => {
      chai
        .request(server)
        .post('/api/1.0/transaction/refund')
        .send({
          idTransaction: createdTransaction.idTransaction,
          idMerchant: createdMerchant.idMerchant,
          amount: 50.00,
        })
        .end((err, res) => {
          expect(res, 'invalid HTTP status').to.have.status(500);
          expect(res.body, 'body is not an object').to.be.a('object');
          expect(res.body, 'body don\'t have *data* property').to.have.property('data');
          expect(res.body, 'body don\'t have *meta* property').to.have.property('meta');
          const transactionMeta = res.body.meta;
          expect(transactionMeta.errorCode, 'error code').to.be.eql('InvalidRefundAmount');
          expect(transactionMeta.errorMessage, 'error code').to.be.eql('Invalid refund amount');
          done();
        });
    });

  });
});
