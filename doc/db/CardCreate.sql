DROP PROCEDURE IF EXISTS CardCreate;

DELIMITER //

CREATE PROCEDURE CardCreate(
  IN IN_number CHAR(16),
  IN IN_name VARCHAR(22),
  IN IN_issuedDate DATE,
  IN IN_expiryDate DATE,
  IN IN_cvv CHAR(3),
  IN IN_pin CHAR(64)
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

  DECLARE PAR_idCard INT;
  
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  	BEGIN
    GET DIAGNOSTICS CONDITION 1 errCode = MYSQL_ERRNO, errMessage = MESSAGE_TEXT;
    CALL CardGetEmpty();
    SELECT totalRecords, errCode, errMessage;
  END;

  START TRANSACTION;
    INSERT INTO Card 
      (status, number, name, issuedDate, expiryDate, cvv, pin, balance, balanceBlocked)
    VALUES
      (' ', IN_number, IN_name, IN_issuedDate, IN_expiryDate, IN_cvv, IN_pin, 0, 0);
  COMMIT;
  SELECT LAST_INSERT_ID() INTO PAR_idCard;
  CALL CardGet(PAR_idCard);
END
//

DELIMITER ;