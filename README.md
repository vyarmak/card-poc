# card-poc
Credit Card POC

# Installation

## Requirements

MySQL version 5.7.12+

Please ensure that mysql is installed with X Protocol option enabled. If not sure - instructions to verify enabled plugins can be found [here](https://dev.mysql.com/doc/refman/5.7/en/obtaining-plugin-information.html) and instructions enable X Protocol can be found [here](https://dev.mysql.com/doc/refman/5.7/en/document-store-setting-up.html)


## CURL's

### Create a card

Example:
```
curl -v -X POST http://localhost:3010/api/1.0/card -H "Content-Type: application/json" -d '{"name": "James Bond"}'
```

Sample result:
```
{
  "meta": { "errorCode": "", "errorMessage": "", "count": 1 },
  "data": [
    {
      "idCard": 1,
      "status": "",
      "number": "5442921958390009",
      "name": "James Bond",
      "issuedDate": "2018-01-29",
      "expiryDate": "2023-01-29",
      "cvv": null,
      "pin": "2931",
      "balance": "0.00",
      "balanceBlocked": "0.00"
    }
  ]
}
```

### Deposit to a card

Example:
```
curl -v -X POST http://localhost:3010/api/1.0/card/deposit -H "Content-Type: application/json" -d '{"number": "5442921958390009", "amount": 1000.10}'
```

Sample result:
```
{
  "meta": { "errorCode": "", "errorMessage": "", "count": 1 },
  "data": [
    {
      "number": "5442921958390009",
      "name": "James Bond",
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
curl -v -X POST http://localhost:3010/api/1.0/card/balance -H "Content-Type: application/json" -d '{"number": "5442921958390009", "pin": "2931"}'
```

Sample result:
```
{
  "meta": { "errorCode": "", "errorMessage": "", "count": 1 },
  "data": [
    {
      "number": "5442921958390009",
      "name": "James Bond",
      "issuedDate": "2018-01-29",
      "expiryDate": "2023-01-29",
      "balance": "1000.10",
      "balanceBlocked": "0.00"
    }
  ]
}
```

### Get Transaction 
```
curl -v -X POST http://localhost:3010/api/1.0/card/transactions -H "Content-Type: application/json" -d '{"number": "5442921958390009", "pin": "2931", "start": "2018-01-01", "end": "2018-02-02"}'
```