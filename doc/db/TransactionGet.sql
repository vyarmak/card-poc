DROP PROCEDURE IF EXISTS TransactionGet;

DELIMITER //

CREATE PROCEDURE TransactionGet(IN IN_idTransaction INT)
LANGUAGE SQL
NOT DETERMINISTIC
CONTAINS SQL
SQL SECURITY DEFINER
COMMENT ''
BEGIN
  /** declare resultset variables **/
  DECLARE totalRecords INT DEFAULT 1;
  DECLARE errCode VARCHAR(255) DEFAULT '';
  DECLARE errMessage VARCHAR(255) DEFAULT '';
  
  SELECT SQL_CALC_FOUND_ROWS 
    Transaction.idTransaction, 
    Transaction.idCard,
    Transaction.createdAt,
    Transaction.type,
    Transaction.amount,
    Transaction.amountCaptured,
    Transaction.idMerchant,
    Merchant.name AS nameMerchant,
    Merchant.idCategory,
    Category.name AS nameCategory
  FROM Transaction 
  LEFT JOIN Merchant ON Merchant.idMerchant = Transaction.idMerchant
  LEFT JOIN Category ON Category.idCategory = Merchant.idCategory
  WHERE 
    Transaction.idTransaction = IN_idTransaction;

  SELECT FOUND_ROWS() AS totalRecords, errCode, errMessage;
END
//

DELIMITER ;
