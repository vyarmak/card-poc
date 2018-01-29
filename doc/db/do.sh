#!/bin/bash

# mysql --login-path=cards cards < create.database.sql
mysql --login-path=cards cards < schema.sql
mysql --login-path=cards cards < data.sql

mysql --login-path=cards cards < CardGet.sql
mysql --login-path=cards cards < CardGetByNumber.sql
mysql --login-path=cards cards < CardGetEmpty.sql
mysql --login-path=cards cards < CardCreate.sql
mysql --login-path=cards cards < CardDeposit.sql

mysql --login-path=cards cards < TransactionGet.sql