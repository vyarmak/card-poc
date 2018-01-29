DROP PROCEDURE IF EXISTS CardGetByNumberAndPin;

DELIMITER //

CREATE PROCEDURE CardGetByNumberAndPin(
  IN IN_number CHAR(16),
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
  DECLARE errCode VARCHAR(255) DEFAULT '';
  DECLARE errMessage VARCHAR(255) DEFAULT '';
  
  SELECT SQL_CALC_FOUND_ROWS 
    Card.idCard, 
    Card.status,
    Card.number,
    Card.name,
    Card.issuedDate,
    Card.expiryDate,
    NULL AS cvv,
    NULL AS pin,
    Card.balance,
    Card.balanceBlocked
  FROM Card 
  WHERE 
    Card.number = IN_number AND Card.pin = IN_pin;

  SELECT FOUND_ROWS() AS totalRecords, errCode, errMessage;
END
//

DELIMITER ;