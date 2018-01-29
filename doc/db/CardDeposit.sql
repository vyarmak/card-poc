DROP PROCEDURE IF EXISTS CardDeposit;

DELIMITER //

CREATE PROCEDURE CardDeposit(
  IN IN_number CHAR(16),
  IN IN_amount DECIMAL(10,2)
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

  DECLARE PAR_idTransaction INT;
  DECLARE PAR_idCard INT;
  
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  	BEGIN
    GET DIAGNOSTICS CONDITION 1 errCode = MYSQL_ERRNO, errMessage = MESSAGE_TEXT;
    CALL CardGetEmpty();
    SELECT totalRecords, errCode, errMessage;
  END;

  START TRANSACTION;
    SELECT idCard INTO PAR_idCard FROM Card WHERE number = IN_number;
    INSERT INTO Transaction 
      (idCard, createdAt, type, amount, amountCaptured, idCategory, idMerchant)
    VALUES
      (PAR_idCard, NOW(), 'D', IN_amount, IN_amount, NULL, NULL);
  COMMIT;
  SELECT LAST_INSERT_ID() INTO PAR_idTransaction;
  START TRANSACTION;
    INSERT INTO TransactionLedger 
      (idTransactionLedger, idTransaction, createdAt, type, amount)
    VALUES
      (NULL, PAR_idTransaction, NOW(), 'D', IN_amount);
    UPDATE Card SET balance = balance + IN_amount WHERE idCard = PAR_idCard;
  COMMIT;
  CALL CardGet(PAR_idCard);
END
//

DELIMITER ;