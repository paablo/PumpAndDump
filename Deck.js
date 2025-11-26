const PlayingCard = require("./PlayingCard");

class Deck {
  constructor() {
    this.deck = [];
    this.reset(); // Add 52 cards to the deck
    this.shuffle(); // Shuffle the deck
  }

  reset() {
    this.deck = [];
    this.deck = PlayingCard.createDeck();
    console.log("Deck:",this.deck);
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
