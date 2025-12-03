class Deck {
  constructor(deck = []) {
    this.deck = deck;
    this.shuffle();
  }

  // Getter for cards to maintain compatibility
  get cards() {
    return this.deck;
  }

  reset() {
    this.deck = [];
  }

  shuffle() {
    let numberOfCards = this.deck.length;
    // Fisher-Yates shuffle - iterate backwards
    for (let i = numberOfCards - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));  // ✅ Random from 0 to i
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
