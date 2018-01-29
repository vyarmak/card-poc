const http = require('http');
const express = require('express');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const busboy = require('connect-busboy');
const config = require('server/config');
const { error, info } = require('server/logger');

const Card = require('server/api/Card');
// const Merchant = require('server/api/Merchant');
const Category = require('server/api/Category');

const app = express();

/** TODO: setup logger according to environment */
app.use(logger('dev'));
/** use busboy */
app.use(busboy());
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
/** use cookie parser */
app.use(cookieParser());
/** eanble proxy trusting */
app.enable('trust proxy', 1);

/** routes */
// create a card
// curl -v -X POST http://localhost:3010/api/1.0/card -H "Content-Type: application/json" -d '{"name": "James Bond"}'
app.post('/api/1.0/card', Card.create);
// curl -v -X POST http://localhost:3010/api/1.0/card/deposit -H "Content-Type: application/json" -d '{"number": "5247591626751671", "amount": 100}'
app.post('/api/1.0/card/deposit', Card.deposit);
// app.get('/api/1.0/card/balance', Card.balance);
// app.get('/api/1.0/card/transactions', Card.transactions);
// app.post('/api/1.0/card/authorize', Card.authorize);
// app.post('/api/1.0/card/capture', Card.capture);
// app.post('/api/1.0/card/revers', Card.reverse);
// app.post('/api/1.0/card/refund', Card.refund);

// app.post('/api/1.0/merchant', Merchant.register);
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
