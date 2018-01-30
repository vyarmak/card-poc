#!/bin/bash

mysql -u cards -h localhost --password=cards cards_test < schema.sql
mysql -u cards -h localhost --password=cards cards_test < data.sql

mysql -u cards -h localhost --password=cards cards_test < CardCreate.sql
mysql -u cards -h localhost --password=cards cards_test < CardDeposit.sql
mysql -u cards -h localhost --password=cards cards_test < CardGet.sql
mysql -u cards -h localhost --password=cards cards_test < CardGetByNumberAndPin.sql
mysql -u cards -h localhost --password=cards cards_test < CardGetEmpty.sql
mysql -u cards -h localhost --password=cards cards_test < CardValidate.sql

mysql -u cards -h localhost --password=cards cards_test < TransactionAuthorize.sql
mysql -u cards -h localhost --password=cards cards_test < TransactionCapture.sql
mysql -u cards -h localhost --password=cards cards_test < TransactionGet.sql
mysql -u cards -h localhost --password=cards cards_test < TransactionRefund.sql
mysql -u cards -h localhost --password=cards cards_test < TransactionReverse.sql

mysql -u cards -h localhost --password=cards cards_test < MerchantCreate.sql
mysql -u cards -h localhost --password=cards cards_test < MerchantGet.sql
mysql -u cards -h localhost --password=cards cards_test < MerchantGetEmpty.sql
