class Merchant {
  constructor(
    idMerchant,
    idCategory,
    name,
    category,
  ) {
    this.idMerchant = idMerchant;
    this.idCategory = idCategory;
    this.name = name;
    this.category = category;
  }

  static fromRow(row) {
    return new Merchant(
      row[0],
      row[1],
      row[2],
      row[3],
    );
  }
}

module.exports = Merchant;
