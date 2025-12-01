/**
 * PlayerManager - Manages player state including cash, portfolios, and actions
 */
class PlayerManager {
	constructor() {
		this.players = []; // Array of player names
		this.playerCash = {}; // Cash balance for each player
		this.playerOwnedStocks = {}; // Stocks owned by each player
		this.playerActionsRemaining = {}; // Actions remaining per turn
		this.playerStockActionsTakenThisTurn = {}; // Track buy/sell actions per turn
	}

	/**
	 * Add a new player to the game
	 */
	addPlayer(name, initialCash = 40) {
		if (!this.players.includes(name)) {
			this.players.push(name);
		}
		if (this.playerCash[name] === undefined) {
			this.playerCash[name] = initialCash;
		}
		if (this.playerOwnedStocks[name] === undefined) {
			this.playerOwnedStocks[name] = [];
		}
		if (this.playerActionsRemaining[name] === undefined) {
			this.playerActionsRemaining[name] = 2;
		}
		if (this.playerStockActionsTakenThisTurn[name] === undefined) {
			this.playerStockActionsTakenThisTurn[name] = {};
		}
	}
	/**
	 * Randomize the player order using Fisher-Yates shuffle
	 * Call this when the game starts to randomize turn order
	 */
	shufflePlayers() {
		for (let i = this.players.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[this.players[i], this.players[j]] = [this.players[j], this.players[i]];
		}
		return this.players;
	}

	/**
	 * Rotate players so the second player becomes first
	 * The first player moves to the end of the array
	 * Call this to change turn order between rounds
	 */
	rotatePlayers() {
		if (this.players.length > 1) {
			const firstPlayer = this.players.shift();
			this.players.push(firstPlayer);
		}
		return this.players;
	}
	/**
	 * Remove a player from the game
	 */
	removePlayer(name) {
		const idx = this.players.indexOf(name);
		if (idx !== -1) {
			this.players.splice(idx, 1);
		}
		delete this.playerCash[name];
		delete this.playerOwnedStocks[name];
		delete this.playerActionsRemaining[name];
		delete this.playerStockActionsTakenThisTurn[name];
	}

	/**
	 * Get all player names
	 */
	getPlayers() {
		return this.players;
	}

	/**
	 * Get player count
	 */
	getPlayerCount() {
		return this.players.length;
	}

	/**
	 * Reset actions for a player (start of their turn)
	 */
	resetPlayerActions(playerName, actionsPerTurn = 2) {
		this.playerActionsRemaining[playerName] = actionsPerTurn;
		this.playerStockActionsTakenThisTurn[playerName] = {};
	}

	/**
	 * Consume an action for a player
	 */
	consumeAction(playerName) {
		if (this.playerActionsRemaining[playerName] > 0) {
			this.playerActionsRemaining[playerName]--;
			return true;
		}
		return false;
	}

	/**
	 * Check if player has actions remaining
	 */
	hasActionsRemaining(playerName) {
		return this.playerActionsRemaining[playerName] > 0;
	}

	/**
	 * Record a stock action (buy or sell) for a player
	 */
	recordStockAction(playerName, stockName, actionType) {
		this.playerStockActionsTakenThisTurn[playerName][stockName] = actionType;
	}

	/**
	 * Check if player has taken an action on a stock this turn
	 */
	getStockAction(playerName, stockName) {
		return this.playerStockActionsTakenThisTurn[playerName][stockName];
	}

	/**
	 * Add stock to player's portfolio
	 */
	addStockToPortfolio(playerName, stock) {
		this.playerOwnedStocks[playerName].push(stock);
	}

	/**
	 * Remove stock from player's portfolio
	 */
	removeStockFromPortfolio(playerName, stock) {
		const portfolio = this.playerOwnedStocks[playerName];
		const stockIndex = portfolio.findIndex(s => 
			s.name === stock.name && 
			s.purchasePrice === stock.purchasePrice && 
			s.purchaseRound === stock.purchaseRound
		);

		if (stockIndex !== -1) {
			portfolio.splice(stockIndex, 1);
			return true;
		}
		return false;
	}

	/**
	 * Get player's portfolio
	 */
	getPlayerPortfolio(playerName) {
		return this.playerOwnedStocks[playerName] || [];
	}

	/**
	 * Get player's cash
	 */
	getPlayerCash(playerName) {
		return this.playerCash[playerName] || 0;
	}

	/**
	 * Add cash to player
	 */
	addCash(playerName, amount) {
		this.playerCash[playerName] = (this.playerCash[playerName] || 0) + amount;
	}

	/**
	 * Subtract cash from player
	 */
	subtractCash(playerName, amount) {
		this.playerCash[playerName] = (this.playerCash[playerName] || 0) - amount;
	}

	/**
	 * Set player's cash
	 */
	setCash(playerName, amount) {
		this.playerCash[playerName] = amount;
	}

	/**
	 * Get all player cash balances
	 */
	getAllCash() {
		return { ...this.playerCash };
	}

	/**
	 * Get total count of how many times a stock has been purchased across all players
	 */
	getStockOwnershipCount(stockName) {
		let count = 0;
		for (const playerName in this.playerOwnedStocks) {
			const ownedStocks = this.playerOwnedStocks[playerName] || [];
			count += ownedStocks.filter(s => s.name === stockName).length;
		}
		return count;
	}

	/**
	 * Get ownership counts for all stocks
	 */
	getStockOwnershipCounts() {
		const counts = {};
		for (const playerName in this.playerOwnedStocks) {
			const ownedStocks = this.playerOwnedStocks[playerName] || [];
			ownedStocks.forEach(stock => {
				counts[stock.name] = (counts[stock.name] || 0) + 1;
			});
		}
		return counts;
	}

	/**
	 * Process dividend payments for a specific round
	 */
	processDividendPayments(roundNumber) {
		// Only pay dividends on even-numbered rounds (2, 4, 6, etc.)
		if (roundNumber % 2 !== 0) {
			return [];
		}

		const dividendPayments = [];

		this.players.forEach(playerName => {
			const ownedStocks = this.playerOwnedStocks[playerName] || [];
			let totalDividends = 0;
			const stockDividends = [];

			ownedStocks.forEach(stock => {
				const dividend = stock.dividend || 0;
				if (dividend > 0) {
					totalDividends += dividend;
					stockDividends.push({
						stockName: stock.name,
						dividend: dividend
					});
				}
			});

			if (totalDividends > 0) {
				this.addCash(playerName, totalDividends);
				dividendPayments.push({
					playerName: playerName,
					totalDividends: totalDividends,
					stockDividends: stockDividends
				});
			}
		});

		return dividendPayments;
	}
}

module.exports = PlayerManager;

