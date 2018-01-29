DROP PROCEDURE IF EXISTS TransactionCapture;

DELIMITER //

CREATE PROCEDURE TransactionCapture(
  IN IN_idTransaction INT,
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

  DECLARE PAR_transactionFound INT;
  DECLARE PAR_idCard INT;
  DECLARE PAR_amountToCapture DECIMAL(10,2);
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
    SELECT idTransaction, idCard, amount - amountCaptured INTO PAR_transactionFound, PAR_idCard, PAR_amountToCapture 
      FROM Transaction 
      WHERE idTransaction = IN_idTransaction AND type = 'P' AND idMerchant = IN_idMerchant;
    SELECT idMerchant INTO PAR_merchantFound FROM Merchant WHERE idMerchant = IN_idMerchant;
    IF (PAR_transactionFound IS NULL) THEN
      SELECT 'InvalidTransaction' INTO errCode;
      SIGNAL SQLSTATE 'SYSER'
        SET MESSAGE_TEXT = 'Invalid transaction ID';
    END IF;
    IF (PAR_merchantFound IS NULL) THEN
      SELECT 'InvalidMerchant' INTO errCode;
      SIGNAL SQLSTATE 'SYSER'
        SET MESSAGE_TEXT = 'Invalid merchant ID';
    END IF;
    IF (PAR_amountToCapture < IN_amount) THEN
      SELECT 'InvalidCaptureAmount' INTO errCode;
      SIGNAL SQLSTATE 'SYSER'
        SET MESSAGE_TEXT = 'Invalid capture amount';
    END IF;
    UPDATE Transaction
      SET amountCaptured = amountCaptured + IN_amount
    WHERE idTransaction = IN_idTransaction;
    INSERT INTO TransactionLedger 
      (idTransactionLedger, idTransaction, createdAt, type, amount)
    VALUES
      (NULL, IN_idTransaction, NOW(), 'C', IN_amount);
    UPDATE Card SET balance = balance - IN_amount, balanceBlocked = balanceBlocked - IN_amount WHERE idCard = PAR_idCard;
  COMMIT;
  CALL TransactionGet(PAR_transactionFound);
END
//

DELIMITER ;
