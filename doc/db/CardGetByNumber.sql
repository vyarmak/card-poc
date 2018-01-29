DROP PROCEDURE IF EXISTS CardGetByNumber;

DELIMITER //

CREATE PROCEDURE CardGetByNumber(IN_number INT)
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
  
  SELECT 
    Card.idCard, 
    Card.status,
    Card.number,
    Card.name,
    Card.issuedDate,
    Card.expiryDate,
    Card.cvv,
    NULL AS pin,
    Card.balance,
    Card.balanceBlocked
  FROM Card 
  WHERE 
    Card.number = IN_number;

  SELECT totalRecords, errCode, errMessage;
END
//

DELIMITER ;