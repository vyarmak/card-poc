DROP PROCEDURE IF EXISTS CardGetEmpty;

DELIMITER //

CREATE PROCEDURE CardGetEmpty()
LANGUAGE SQL
NOT DETERMINISTIC
CONTAINS SQL
SQL SECURITY DEFINER
COMMENT ''
BEGIN
  SELECT 
    NULL AS idCard, 
    NULL AS status,
    NULL AS number,
    NULL AS name,
    NULL AS issuedDate,
    NULL AS expiryDate,
    NULL AS cvv,
    NULL AS pin,
    NULL AS balance,
    NULL AS balanceBlocked;
END
//

DELIMITER ;