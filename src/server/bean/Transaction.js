class Transaction {
  constructor(
    idTransaction,
    idCard,
    createdAt,
    type,
    amount,
    amountCaptured,
    idMerchant,
    merchant,
    idCategory,
    category,
  ) {
    this.idTransaction = idTransaction;
    this.idCard = idCard;
    this.createdAt = createdAt;
    this.type = type;
    this.amount = amount;
    this.amountCaptured = amountCaptured;
    this.idMerchant = idMerchant;
    this.merchant = merchant;
    this.idCategory = idCategory;
    this.category = category;
  }

  static fromRow(row) {
    return new Transaction(
      row[0],
      row[1],
      row[2],
      row[3],
      row[4],
      row[5],
      row[6],
      row[7],
      row[8],
      row[9],
    );
  }
}

module.exports = Transaction;
