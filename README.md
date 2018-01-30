# card-poc
Credit Card POC

# Installation

Use `yarn install` to install all necessary packages.

You can also use `npm` instead of `yarn`.

## Requirements

Latest stable:
- node (8.9.4+)
- yarn (1.3.2+) or npm (5.6.0+)

MySQL version **5.7.12+**

**IMPORTANT** Please ensure that mysql is installed with X Protocol option enabled. If not sure - instructions to verify enabled plugins can be found [here](https://dev.mysql.com/doc/refman/5.7/en/obtaining-plugin-information.html) and instructions enable X Protocol can be found [here](https://dev.mysql.com/doc/refman/5.7/en/document-store-setting-up.html)

## DB creation

You can use script provided in `doc/db/create.database.sql` to create a database.

To create a database structure and pre-load categories you can use script `doc/db/create.database.structure.sh` or manually execute SQL scripts located in `doc/db` in following order:

- schema.sql
- data.sql
- CardCreate.sql
- CardDeposit.sql
- CardGet.sql
- CardGetByNumberAndPin.sql
- CardGetEmpty.sql
- CardValidate.sql
- TransactionAuthorize.sql
- TransactionCapture.sql
- TransactionGet.sql
- TransactionRefund.sql
- TransactionReverse.sql
- MerchantCreate.sql
- MerchantGet.sql
- MerchantGetEmpty.sql

# Runing a server

To start a server use `yarn start`.

## Description

Every resultset will have following format:
```
{
  "meta": { "errorCode": "", "errorMessage": "", "count": 1 },
  "data": [...]
}
```

Where:
- `meta` - resultset metadata
  - `errorCode` - error code (in case of error)
  - `errorMessage` - error message (in case of error)
  - `count` - number of records in resultset
- `data` - resultset data (array)

# Automated testing

To run automated tests please create a clean `cards_test` database (use `doc/db/create.database.test.sql` + SQL scripts located in `doc/db`)

After this you can run end-to-end testing by: 
```
yarn test
```

# Manual testing

Following CURL's can be used as for sample testing

## Merchant registration operations
### List merchant categories


```
curl -v -X GET http://localhost:3010/api/1.0/categories -H "Content-Type: application/json"
```

### Create merchant account

```
curl -v -X POST http://localhost:3010/api/1.0/merchant -H "Content-Type: application/json" -d '{"idCategory": 22, "name": "Satrbucks"}'
```

Where:
- `idCategory` - id of a category from category list
- `name` merchant name (will be used in transaction description)

## Card operations
### Create a card

Example:
```
curl -v -X POST http://localhost:3010/api/1.0/card -H "Content-Type: application/json" -d '{"name": "John Doe"}'
```

Sample response:
```
{
  "meta": { "errorCode": "", "errorMessage": "", "count": 1 },
  "data": [
    {
      "idCard": 1,
      "status": "",
      "number": "5331952051035583",
      "name": "John Doe",
      "issuedDate": "2018-01-29",
      "expiryDate": "2023-01-29",
      "cvv": null,
      "pin": "0962",
      "balance": "0.00",
      "balanceBlocked": "0.00"
    }
  ]
}
```

Please, take a note of returned card data. It will be required later to make transactions.

### Deposit to a card (load money)

Example:
```
curl -v -X POST http://localhost:3010/api/1.0/card/deposit -H "Content-Type: application/json" -d '{"number": "5331952051035583", "amount": 1100.10}'
```

Where:
- `number` - card number
- `amount` - amount to be loaded

Sample response:
```
{
  "meta": { "errorCode": "", "errorMessage": "", "count": 1 },
  "data": [
    {
      "number": "5331952051035583",
      "name": "John Doe",
      "issuedDate": "2018-01-29",
      "expiryDate": "2023-01-29",
      "balance": "1000.10",
      "balanceBlocked": "0.00"
    }
  ]
}
```

### Check balance

Use a card number and PIN obtained while creating a card.

Example:
```
curl -v -X POST http://localhost:3010/api/1.0/card/balance -H "Content-Type: application/json" -d '{"number": "5331952051035583", "pin": "0962"}'
```

Sample response:
```
{
  "meta": { "errorCode": "", "errorMessage": "", "count": 1 },
  "data": [
    {
      "number": "5331952051035583",
      "name": "John Doe",
      "issuedDate": "2018-01-29",
      "expiryDate": "2023-01-29",
      "balance": "1000.10",
      "balanceBlocked": "0.00"
    }
  ]
}
```

### Get Transaction 

Example:
```
curl -v -X POST http://localhost:3010/api/1.0/transactions/list -H "Content-Type: application/json" -d '{"number": "5331952051035583", "pin": "0962", "start": "2018-01-01", "end": "2018-02-02"}'
```

Where:
- `number` - card number
- `pin` - PIN code
- `start` - (optional) start date to show transactions from
- `end` - (optional) start date to show transactions till

## Merchant operations

### Authorization request

To authorize merchant must provide following information:
- `number` - card number
- `name` - card holder name
- `expiryDate` - card expiration date
- `cvv` - card CVV code
- `pin` - card PIN code
- `idMerchant` - merchant ID
- `amount` - authorization amount

```
curl -v -X POST http://localhost:3010/api/1.0/transaction/authorize -H "Content-Type: application/json" -d '{"number": "5546062490671062", "name": "John Doe", "expiryDate": "2023-01-29", "cvv": "619", "pin": "0962", "idMerchant": 1, "amount": 22.22}'
```

### Capture transaction

For capture transaction merchant needs to provide following information:
- `idTransaction` - id of transaction created with authorization request
- `idMerchant` - merchant ID
- `amount` - capture amount

```
curl -v -X POST http://localhost:3010/api/1.0/transaction/capture -H "Content-Type: application/json" -d '{"idTransaction": 3, "idMerchant": 1, "amount": 50}'
```

### Reverse transaction

For reverse transaction merchant needs to provide following information:
- `idTransaction` - id of transaction created with authorization request
- `idMerchant` - merchant ID
- `amount` - reverse amount

```
curl -v -X POST http://localhost:3010/api/1.0/transaction/reverse -H "Content-Type: application/json" -d '{"idTransaction": 3, "idMerchant": 1, "amount": 50}'
```

### Refund transaction

For refund transaction merchant needs to provide following information:
- `idTransaction` - id of transaction created with authorization request
- `idMerchant` - merchant ID
- `amount` - refund amount

```
curl -v -X POST http://localhost:3010/api/1.0/transaction/refund -H "Content-Type: application/json" -d '{"idTransaction": 3, "idMerchant": 1, "amount": 50}'
```
