const Card = require("./Card");

class PlayingCard extends Card {
  constructor(suit, value) {
    const name = `${value} of ${suit}`;
    const description = "A standard playing card";
    super(name, description);
    
    this.suit = suit;
    this.value = value;
    
    // derive a numeric rank for common card names
    if (typeof value === "number") {
      this.rank = value;
    } else {
      const map = { Ace: 1, Jack: 11, Queen: 12, King: 13 };
      this.rank = map[value] || null;
    }
  }

  getRank() {
    return this.rank;
  }

  toString() {
    return this.name;
  }

  // Ensure proper JSON serialization
  toJSON() {
    return {
      name: this.name,
      description: this.description,
      suit: this.suit,
      value: this.value,
      rank: this.rank
    };
  }

  // add static suit/value definitions and deck factory
  static SUITS = ["Hearts", "Diamonds", "Clubs", "Spades"];
  static VALUES = ["Ace", 2, 3, 4, 5, 6, 7, 8, 9, 10, "Jack", "Queen", "King"];

  static createDeck() {
    const deck = [];
    for (let suit of this.SUITS) {
      for (let value of this.VALUES) {
        deck.push(new this(suit, value));
      }
    }
    return deck;
  }
}

module.exports = PlayingCard;
