class Card {
  constructor(
    idCard,
    status,
    number,
    name,
    issuedDate,
    expiryDate,
    cvv,
    pin,
    balance,
    balanceBlocked,
  ) {
    this.idCard = idCard;
    this.status = status;
    this.number = number;
    this.name = name;
    this.issuedDate = issuedDate;
    this.expiryDate = expiryDate;
    this.cvv = cvv;
    this.pin = pin;
    this.balance = balance;
    this.balanceBlocked = balanceBlocked;
  }

  forClient() {
    const obj = Object.assign({}, this);
    delete obj.idCard;
    delete obj.status;
    delete obj.cvv;
    delete obj.pin;
    return obj;
  }

  static fromRow(row) {
    return new Card(row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7], row[8], row[9]);
  }
}

module.exports = Card;
