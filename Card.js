class Card {
  constructor(name = "Card", description = "A generic card") {
    this.name = String(name);
    this.description = String(description);
  }

  toString() {
    return this.name;
  }

  getDescription() {
    return this.description;
  }

  // Ensure proper JSON serialization
  toJSON() {
    return {
      name: this.name,
      description: this.description
    };
  }
}

module.exports = Card;
