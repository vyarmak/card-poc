DROP PROCEDURE IF EXISTS MerchantCreate;

DELIMITER //

CREATE PROCEDURE MerchantCreate(
  IN IN_idCategory INT,
  IN IN_name VARCHAR(64)
)
LANGUAGE SQL
NOT DETERMINISTIC
CONTAINS SQL
SQL SECURITY DEFINER
COMMENT ''
BEGIN
  /** declare resultset variables **/
  DECLARE totalRecords INT DEFAULT 0;
  DECLARE errCode VARCHAR(255) DEFAULT "";
  DECLARE errMessage VARCHAR(255) DEFAULT "";

  DECLARE PAR_idMerchant INT;
  
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  	BEGIN
    GET DIAGNOSTICS CONDITION 1 errCode = MYSQL_ERRNO, errMessage = MESSAGE_TEXT;
    CALL MerchantGetEmpty();
    SELECT totalRecords, errCode, errMessage;
  END;

  START TRANSACTION;
    INSERT INTO Merchant 
      (idCategory, name)
    VALUES
      (IN_idCategory, IN_name);
  COMMIT;
  SELECT LAST_INSERT_ID() INTO PAR_idMerchant;
  CALL MerchantGet(PAR_idMerchant);
END
//

DELIMITER ;