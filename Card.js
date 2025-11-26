class Card {
  constructor(value) {
    this.value = value;
    this.description = "Card";
  }

  toString() {
    return `${this.value}`;
  }

}

module.exports = Card;
