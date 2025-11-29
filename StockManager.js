const Deck = require("./Deck");
const StockCard = require("./StockCard");

class StockManager {
	constructor() {
		this.stockDeck = null;
	}

	initialize() {
		this.stockDeck = new Deck(StockCard.createDeck());
	}

	/**
	 * Deal stock cards, reshuffling if needed
	 * @param {number} count Number of stocks to deal
	 * @returns {Array} Array of stock cards
	 */
	dealStocks(count = 3) {
		if (!this.stockDeck || typeof this.stockDeck.length !== "function" || this.stockDeck.length() <= count) {
			this.stockDeck = new Deck(StockCard.createDeck());
		}

		const stocks = [];
		for (let i = 0; i < count; i++) {
			stocks.push(this.stockDeck.deal());
		}
		return stocks;
	}

	/**
	 * Get all stocks for a specific index/sector
	 */
	getStocksForIndex(indexName) {
		if (!this.stockDeck || !this.stockDeck.cards) return [];
		return this.stockDeck.cards.filter(stock => stock.industrySector === indexName);
	}

	/**
	 * Update index prices based on stock activity
	 */
	updateIndexPrices(indexes) {
		if (!indexes || !this.stockDeck) return;
		
		indexes.forEach(index => {
			const relatedStocks = index.getRelatedStocks(this.stockDeck.cards);
			if (relatedStocks.length > 0) {
				const performance = index.getSectorPerformance(this.stockDeck.cards);
				const adjustment = Math.sign(performance - index.price);
				index.updatePrice(adjustment);
			}
		});
	}
}

module.exports = StockManager;

