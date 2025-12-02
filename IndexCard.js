const Card = require('./Card');

class IndexCard extends Card {
  constructor({ name, price = 10, emoji = "📈", description = "Market Index" } = {}) {
    // pass name and description to base Card
    const indexName = String(name || 'Unnamed Index');
    const indexDescription = String(description);
    super(indexName, indexDescription);

    // price must be a number
    this.price = Number(price);
    if (!Number.isFinite(this.price)) {
      throw new Error('price must be a finite number');
    }

    // emoji for visual representation
    this.emoji = String(emoji);
  }

  // update price by a delta (can be positive or negative)
  updatePrice(delta) {
    this.price += Number(delta);
    // ensure price doesn't go below 1
    if (this.price < 1) {
      this.price = 1;
    }
    return this.price;
  }

  // set price directly
  setPrice(newPrice) {
    this.price = Number(newPrice);
    if (!Number.isFinite(this.price) || this.price < 1) {
      throw new Error('price must be a finite number >= 1');
    }
    return this.price;
  }

  toString() {
    return `${this.emoji} ${this.name} — price:${this.price}`;
  }

  // Get all stocks related to this index
  getRelatedStocks(stocks) {
    if (!Array.isArray(stocks)) return [];
    return stocks.filter(stock => stock.industrySector === this.name);
  }

  // Calculate the average performance of stocks in this sector
  getSectorPerformance(stocks) {
    const relatedStocks = this.getRelatedStocks(stocks);
    if (relatedStocks.length === 0) return 0;
    
    const avgCost = relatedStocks.reduce((sum, stock) => sum + stock.baseCost, 0) / relatedStocks.length;
    return Math.round(avgCost);
  }

  // Ensure proper JSON serialization for socket.io
  toJSON() {
    return {
      name: this.name,
      description: this.description,
      price: this.price,
      emoji: this.emoji
    };
  }

  // Factory method to create the 4 default market indexes
  static createIndexes() {
    const indexData = [
      {
        name: "tech",
        price: 5 + Math.floor(Math.random() * 2) + 1, // 6-11
        emoji: "💻",
        description: "Technology sector index tracking innovation and digital transformation"
      },
      {
        name: "finance",
        price: 5 + Math.floor(Math.random() * 2) + 1, // 6-11
        emoji: "🏦",
        description: "Financial sector index tracking banks, investment firms, and lending institutions"
      },
      {
        name: "industrial",
        price: 5 + Math.floor(Math.random() * 2) + 1, // 6-11
        emoji: "🏭",
        description: "Industrial sector index tracking production, manufacturing and automation"
      },
      {
        name: "Health and Science",
        price: 5 + Math.floor(Math.random() * 2) + 1, // 6-11
        emoji: "🧬",
        description: "Health & Science sector index tracking pharmaceuticals, biotech, and medical technology"
      }
    ];

    return indexData.map(spec => new IndexCard(spec));
  }
}

module.exports = IndexCard;

