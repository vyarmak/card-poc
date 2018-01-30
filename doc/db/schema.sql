SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS `Category`;
CREATE TABLE IF NOT EXISTS `Category` (
  `idCategory` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(64) NOT NULL,
  PRIMARY KEY (`idCategory`))
ENGINE = InnoDB;

DROP TABLE IF EXISTS `Merchant`;
CREATE TABLE IF NOT EXISTS `Merchant` (
  `idMerchant` INT NOT NULL AUTO_INCREMENT,
  `idCategory` INT NOT NULL,
  `name` VARCHAR(64) NOT NULL,
  PRIMARY KEY (`idMerchant`),
  INDEX `fk_Merchant_Category_idx` (`idCategory` ASC),
  CONSTRAINT `fk_Merchant_Category`
    FOREIGN KEY (`idCategory`)
    REFERENCES `Category` (`idCategory`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

DROP TABLE IF EXISTS `Card`;
CREATE TABLE IF NOT EXISTS `Card` (
  `idCard` INT NOT NULL AUTO_INCREMENT,
  `status` CHAR(1) NOT NULL DEFAULT ' ' COMMENT 'B - Blocked',
  `number` CHAR(16) NOT NULL,
  `name` VARCHAR(22) NOT NULL,
  `issuedDate` DATE NOT NULL,
  `expiryDate` DATE NOT NULL,
  `cvv` CHAR(3) NOT NULL,
  `pin` CHAR(64) NOT NULL,
  `balance` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `balanceBlocked` DECIMAL(10,2) NOT NULL DEFAULT 0,
  PRIMARY KEY (`idCard`))
ENGINE = InnoDB;

DROP TABLE IF EXISTS `Transaction`;
CREATE TABLE IF NOT EXISTS `Transaction` (
  `idTransaction` INT NOT NULL AUTO_INCREMENT,
  `idCard` INT NOT NULL,
  `createdAt` DATETIME NOT NULL,
  `type` CHAR(1) NOT NULL COMMENT 'P - Purchase\nD - Deposit',
  `amount` DECIMAL(10,2) NOT NULL,
  `amountCaptured` DECIMAL(10,2) NOT NULL,
  `idMerchant` INT NULL,
  PRIMARY KEY (`idTransaction`),
  INDEX `fk_Transaction_Card_idx` (`idCard` ASC),
  INDEX `fk_Transaction_Marchant_idx` (`idMerchant` ASC),
  CONSTRAINT `fk_Transaction_Card`
    FOREIGN KEY (`idCard`)
    REFERENCES `Card` (`idCard`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Transaction_Marchant`
    FOREIGN KEY (`idMerchant`)
    REFERENCES `Merchant` (`idMerchant`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

DROP TABLE IF EXISTS `TransactionLedger`;
CREATE TABLE IF NOT EXISTS `TransactionLedger` (
  `idTransactionLedger` INT NOT NULL AUTO_INCREMENT,
  `idTransaction` INT NOT NULL,
  `createdAt` DATETIME NOT NULL,
  `type` CHAR(1) NOT NULL COMMENT 'A - Authorization\nC - Capture\nV - ReVerse\nR - Refund\nD - Deposit',
  `amount` DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (`idTransactionLedger`),
  INDEX `fk_TransactionLedger_Transaction_idx` (`idTransaction` ASC),
  CONSTRAINT `fk_TransactionLedger_Transaction`
    FOREIGN KEY (`idTransaction`)
    REFERENCES `Transaction` (`idTransaction`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

SET FOREIGN_KEY_CHECKS=1;
