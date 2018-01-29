#!/bin/bash

mysql -u cards -h localhost --password=cards cards < schema.sql
mysql -u cards -h localhost --password=cards cards < data.sql

mysql -u cards -h localhost --password=cards cards < CardCreate.sql
mysql -u cards -h localhost --password=cards cards < CardDeposit.sql
mysql -u cards -h localhost --password=cards cards < CardGet.sql
mysql -u cards -h localhost --password=cards cards < CardGetByNumberAndPin.sql
mysql -u cards -h localhost --password=cards cards < CardGetEmpty.sql
mysql -u cards -h localhost --password=cards cards < CardValidate.sql

mysql -u cards -h localhost --password=cards cards < TransactionAuthorize.sql
mysql -u cards -h localhost --password=cards cards < TransactionCapture.sql
mysql -u cards -h localhost --password=cards cards < TransactionGet.sql
mysql -u cards -h localhost --password=cards cards < TransactionRefund.sql
mysql -u cards -h localhost --password=cards cards < TransactionReverse.sql

mysql -u cards -h localhost --password=cards cards < MerchantCreate.sql
mysql -u cards -h localhost --password=cards cards < MerchantGet.sql
mysql -u cards -h localhost --password=cards cards < MerchantGetEmpty.sql
