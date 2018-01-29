const http = require('http');
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const config = require('server/config');
const { error, info } = require('server/logger');

const Card = require('server/api/Card');
const Transaction = require('server/api/Transaction');
const Merchant = require('server/api/Merchant');
const Category = require('server/api/Category');

const app = express();

/** TODO: setup logger according to environment */
app.use(logger('dev'));
/** configure body parsing  */
app.use(bodyParser.json({
  limit: '20mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  },
}));
app.use(bodyParser.urlencoded({
  limit: '40mb',
  extended: true,
  verify: (req, res, buf) => {
    req.rawBody = buf;
  },
}));
/** eanble proxy trusting */
app.enable('trust proxy', 1);

/** routes */
// curl -v -X POST http://localhost:3010/api/1.0/card -H "Content-Type: application/json" -d '{"name": "James Bond"}'
app.post('/api/1.0/card', Card.create);
// curl -v -X POST http://localhost:3010/api/1.0/card/deposit -H "Content-Type: application/json" -d '{"number": "5247591626751671", "amount": 100}'
app.post('/api/1.0/card/deposit', Card.deposit);
// curl -v -X POST http://localhost:3010/api/1.0/card/balance -H "Content-Type: application/json" -d '{"number": "5247591626751671", "pin": "1234"}'
app.post('/api/1.0/card/balance', Card.balance);

// curl -v -X POST http://localhost:3010/api/1.0/transactions/list -H "Content-Type: application/json" -d '{"number": "5247591626751671", "pin": "1234", "start": "2018-01-01", "end": "2018-02-02"}'
app.post('/api/1.0/transactions/list', Transaction.getTransactionsByNumberAndPin);
// curl -v -X POST http://localhost:3010/api/1.0/transaction/authorize -H "Content-Type: application/json" -d '{"number": "5247591626751671", "name": "James Bond", "expiryDate": "2023-01-29", "cvv": "225", "pin": "1234", "idMerchant": 1, "amount": 22.22}'
app.post('/api/1.0/transaction/authorize', Transaction.authorize);
// curl -v -X POST http://localhost:3010/api/1.0/transaction/capture -H "Content-Type: application/json" -d '{"idTransaction": 3, "idMerchant": 1, "amount": 50}'
app.post('/api/1.0/transaction/capture', Transaction.capture);
// curl -v -X POST http://localhost:3010/api/1.0/transaction/reverse -H "Content-Type: application/json" -d '{"idTransaction": 3, "idMerchant": 1, "amount": 50}'
app.post('/api/1.0/transaction/reverse', Transaction.reverse);
// curl -v -X POST http://localhost:3010/api/1.0/transaction/refund -H "Content-Type: application/json" -d '{"idTransaction": 3, "idMerchant": 1, "amount": 50}'
app.post('/api/1.0/transaction/refund', Transaction.refund);

// curl -v -X POST http://localhost:3010/api/1.0/merchant -H "Content-Type: application/json" -d '{"idCategory": 22, "name": "Satrbucks"}'
app.post('/api/1.0/merchant', Merchant.register);
// curl -v -X GET http://localhost:3010/api/1.0/categories -H "Content-Type: application/json"
app.get('/api/1.0/categories', Category.getAll);

/** confure and start app */
app.set('port', config.port);
const server = http.createServer(app);
server.listen(config.port, (err) => {
  if (err) {
    error('Error starting server', err);
    throw err;
  }
  const addr = server.address();
  const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
  info(`Listening on ${bind}`);
});
