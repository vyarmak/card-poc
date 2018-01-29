DROP PROCEDURE IF EXISTS MerchantGet;

DELIMITER //

CREATE PROCEDURE MerchantGet(IN IN_idMerchant INT)
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
    Merchant.idMerchant, 
    Merchant.idCategory,
    Merchant.name,
    Category.name AS nameCategory
  FROM Merchant 
  LEFT JOIN Category ON Category.idCategory = Merchant.idCategory
  WHERE 
    Merchant.idMerchant = IN_idMerchant;

  SELECT FOUND_ROWS() AS totalRecords, errCode, errMessage;
END
//

DELIMITER ;