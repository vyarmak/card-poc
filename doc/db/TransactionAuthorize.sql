DROP PROCEDURE IF EXISTS TransactionAuthorize;

DELIMITER //

CREATE PROCEDURE TransactionAuthorize(
  IN IN_idCard INT,
  IN IN_idMerchant INT,
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
  DECLARE PAR_balance DECIMAL(10,2);
  DECLARE PAR_merchantFound INT;
  
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  	BEGIN
    GET DIAGNOSTICS CONDITION 1 errCode = MYSQL_ERRNO, errMessage = MESSAGE_TEXT;
    CALL CardGetEmpty();
    SELECT totalRecords, errCode, errMessage;
  END;
  DECLARE EXIT HANDLER FOR SQLSTATE 'SYSER'
    BEGIN
    GET DIAGNOSTICS CONDITION 1 errMessage = MESSAGE_TEXT;
    CALL CardGetEmpty();
    SELECT totalRecords, errCode, errMessage;
  END;

  START TRANSACTION;
    SELECT balance INTO PAR_balance FROM Card WHERE idCard = IN_idCard;
    SELECT idMerchant INTO PAR_merchantFound FROM Merchant WHERE idMerchant = IN_idMerchant;
    IF (PAR_merchantFound IS NULL) THEN
      SELECT 'InvalidMerchant' INTO errCode;
      SIGNAL SQLSTATE 'SYSER'
        SET MESSAGE_TEXT = 'Invalid merchant';
    END IF;
    IF (PAR_balance < IN_amount) THEN
      SELECT 'InsuficientFunds' INTO errCode;
      SIGNAL SQLSTATE 'SYSER'
        SET MESSAGE_TEXT = 'Insuficient funds';
    END IF;
    INSERT INTO Transaction 
      (idCard, createdAt, type, amount, amountCaptured, idMerchant)
    VALUES
      (IN_idCard, NOW(), 'P', IN_amount, 0, IN_idMerchant);
  COMMIT;
  SELECT LAST_INSERT_ID() INTO PAR_idTransaction;
  START TRANSACTION;
    INSERT INTO TransactionLedger 
      (idTransactionLedger, idTransaction, createdAt, type, amount)
    VALUES
      (NULL, PAR_idTransaction, NOW(), 'A', IN_amount);
    UPDATE Card SET balanceBlocked = balanceBlocked + IN_amount WHERE idCard = IN_idCard;
  COMMIT;
  CALL TransactionGet(PAR_idTransaction);
END
//

DELIMITER ;
