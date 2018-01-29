DROP PROCEDURE IF EXISTS CardGet;

DELIMITER //

CREATE PROCEDURE CardGet(IN_idCard INT)
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
    Card.idCard = IN_idCard;

  SELECT FOUND_ROWS() AS totalRecords, errCode, errMessage;
END
//

DELIMITER ;