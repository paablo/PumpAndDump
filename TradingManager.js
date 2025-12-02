/**
 * TradingManager - Handles stock trading operations (buy/sell)
 */
class TradingManager {
	constructor(playerManager, logger) {
		this.playerManager = playerManager;
		this.logger = logger;
		this.currentBoardStocks = []; // Stocks currently available on the board
		this.stocksPurchasedThisRound = new Set(); // Track which stocks were purchased this round
	}

	/**
	 * Set the current board stocks
	 */
	setBoardStocks(stocks) {
		this.currentBoardStocks = stocks;
	}

	/**
	 * Get current board stocks
	 */
	getBoardStocks() {
		return this.currentBoardStocks;
	}

	/**
	 * Calculate market price for a stock
	 */
	calculateStockPrice(stock, indexes) {
		const index = indexes.find(idx => idx.name === stock.industrySector);
		const indexPrice = index ? index.price : 0;
		const baseCost = stock.baseCost || 0;
		const growth = stock.growth || 0;
		const stocksOwned = this.playerManager.getStockOwnershipCount(stock.name);
		return baseCost + indexPrice + (growth * stocksOwned);
	}

	calculateStockSellPrice(stock, indexes) {
		// To prevent players just buying and selling the same stock to make money
		// We subtract the growth from the price
		const sellPrice = this.calculateStockPrice(stock, indexes) - stock.growth;

		return sellPrice > 0 ? sellPrice : 1;
	}

	/**
	 * Purchase a stock for a player
	 */
	purchaseStock(playerName, stock, indexes, roundNumber) {
		// Validate player exists
		if (!this.playerManager.getPlayers().includes(playerName)) {
			return { success: false, message: "Player not in game" };
		}

		// Check actions remaining
		if (!this.playerManager.hasActionsRemaining(playerName)) {
			return { success: false, message: "No actions left this turn" };
		}

		// Check if player already bought this stock this turn
		const existingAction = this.playerManager.getStockAction(playerName, stock.name);
		if (existingAction === 'buy') {
			return { success: false, message: "You cannot buy the same stock twice in one turn" };
		}

		// Check if player sold this stock this turn
		if (existingAction === 'sell') {
			return { success: false, message: "You cannot buy a stock you sold this turn" };
		}

		// Calculate and validate price
		const stockPrice = this.calculateStockPrice(stock, indexes);
		if (stockPrice <= 0) {
			return { success: false, message: "Invalid stock price" };
		}

		// Check if player has enough cash
		const playerCash = this.playerManager.getPlayerCash(playerName);
		if (playerCash < stockPrice) {
			return { 
				success: false, 
				message: `Insufficient funds. Need $${stockPrice}, have $${playerCash}` 
			};
		}

		// Execute purchase
		this.playerManager.subtractCash(playerName, stockPrice);
		this.playerManager.consumeAction(playerName);
		this.playerManager.recordStockAction(playerName, stock.name, 'buy');

		const stockName = stock.name || stock.companyName || 'Stock';
		const purchasedStock = {
			...stock,
			purchasePrice: stockPrice,
			purchaseRound: roundNumber
		};

		this.playerManager.addStockToPortfolio(playerName, purchasedStock);
		this.stocksPurchasedThisRound.add(stock.name);

		this.logger.addToGameLog(`💰 ${playerName} purchased ${stockName} for $${stockPrice}`);

		return {
			success: true,
			message: '',
			playerCash: this.playerManager.getPlayerCash(playerName),
			ownedStocks: this.playerManager.getPlayerPortfolio(playerName),
			actionsRemaining: this.playerManager.playerActionsRemaining[playerName]
		};
	}

	/**
	 * Sell a stock for a player
	 */
	sellStock(playerName, ownedStock, indexes) {
		// Validate player exists
		if (!this.playerManager.getPlayers().includes(playerName)) {
			return { success: false, message: "Player not in game" };
		}

		// Check actions remaining
		if (!this.playerManager.hasActionsRemaining(playerName)) {
			return { success: false, message: "No actions left this turn" };
		}

		// Check if player already sold this stock this turn
		const existingAction = this.playerManager.getStockAction(playerName, ownedStock.name);
		if (existingAction === 'sell') {
			return { success: false, message: "You cannot sell the same stock twice in one turn" };
		}

		// Check if player bought this stock this turn
		if (existingAction === 'buy') {
			return { success: false, message: "You cannot sell a stock you bought this turn" };
		}

		// Verify stock ownership
		const removed = this.playerManager.removeStockFromPortfolio(playerName, ownedStock);
		if (!removed) {
			return { success: false, message: "Stock not found in your portfolio" };
		}

		// Calculate sale price and profit/loss
		const salePrice = this.calculateStockSellPrice(ownedStock, indexes);
		const profitLoss = salePrice - ownedStock.purchasePrice;

		// Execute sale
		this.playerManager.addCash(playerName, salePrice);
		this.playerManager.consumeAction(playerName);
		this.playerManager.recordStockAction(playerName, ownedStock.name, 'sell');

		const profitLossIndicator = profitLoss > 0 ? '📈' : profitLoss < 0 ? '📉' : '➖';
		this.logger.addToGameLog(
			`💰 ${playerName} sold ${ownedStock.name} for $${salePrice} ` +
			`(${profitLossIndicator} ${profitLoss >= 0 ? '+' : ''}${profitLoss})`
		);

		return {
			success: true,
			message: '',
			playerCash: this.playerManager.getPlayerCash(playerName),
			ownedStocks: this.playerManager.getPlayerPortfolio(playerName),
			actionsRemaining: this.playerManager.playerActionsRemaining[playerName],
			salePrice: salePrice,
			profitLoss: profitLoss
		};
	}

	/**
	 * Update board stocks at end of round: keep purchased, remove unpurchased, add new
	 */
	updateBoardStocks(stockManager, maxStocks = 6, newStocksToDeal = 2) {
		const keptStocks = this.currentBoardStocks.filter(stock => 
			this.playerManager.getStockOwnershipCount(stock.name) > 0
		);
	
		// Track removed stocks
		const removedStocks = this.currentBoardStocks.filter(stock => 
			this.playerManager.getStockOwnershipCount(stock.name) === 0
		);

		// Mark kept stocks as "carryover"
		keptStocks.forEach(stock => {
			stock.isCarryover = true;
		});

		// Log removed stocks
		if (removedStocks.length > 0) {
			const removedNames = removedStocks.map(s => s.name).join(', ');
			this.logger.addToGameLog(`📤 Removed unpurchased stocks: ${removedNames}`);
		}

		// Calculate how many new stocks to deal
		const spacesAvailable = maxStocks - keptStocks.length;
		const actualNewStocks = Math.min(newStocksToDeal, spacesAvailable);

		// Deal new stocks
		const newStocks = actualNewStocks > 0 ? stockManager.dealStocks(actualNewStocks) : [];

		// Mark new stocks as fresh
		newStocks.forEach(stock => {
			stock.isCarryover = false;
		});

		// Update current board stocks
		this.currentBoardStocks = [...keptStocks, ...newStocks];

		// Reset purchased stocks tracker
		this.stocksPurchasedThisRound.clear();

		// Log new stocks
		if (newStocks.length > 0) {
			const newNames = newStocks.map(s => s.name).join(', ');
			this.logger.addToGameLog(`📥 New stocks available: ${newNames}`);
		}

		// Log if at max capacity
		if (this.currentBoardStocks.length >= maxStocks) {
			this.logger.addToGameLog(`📊 Stock board at maximum capacity (${maxStocks} stocks)`);
		}

		return {
			keptStocks,
			removedStocks,
			newStocks,
			currentBoardStocks: this.currentBoardStocks
		};
	}

	/**
	 * Reset purchased stocks tracker (for new round)
	 */
	resetPurchasedTracking() {
		this.stocksPurchasedThisRound.clear();
	}
}

module.exports = TradingManager;

