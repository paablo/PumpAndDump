class Deck {
  constructor(deck = []) {
    this.deck = deck;
    this.shuffle();
  }

  reset() {
    this.deck = [];
  }

  shuffle() {
    let numberOfCards = this.deck.length;
    for (var i = 0; i < numberOfCards; i++) {
      let j = Math.floor(Math.random() * numberOfCards);
      let tmp = this.deck[i];
      this.deck[i] = this.deck[j];
      this.deck[j] = tmp;
    }
  }

  deal() {
    return this.deck.pop();
  }

  isEmpty() {
    return this.deck.length == 0;
  }

  length() {
    return this.deck.length;
  }
}

module.exports = Deck;
