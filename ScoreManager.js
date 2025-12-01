/**
 * ScoreManager - Handles scoring, net worth calculations, and end game logic
 */
class ScoreManager {
	constructor(playerManager, tradingManager, logger) {
		this.playerManager = playerManager;
		this.tradingManager = tradingManager;
		this.logger = logger;
	}

	/**
	 * Calculate a player's net worth (cash + value of owned stocks)
	 */
	calculateNetWorth(playerName, indexes) {
		const cash = this.playerManager.getPlayerCash(playerName);
		const portfolio = this.playerManager.getPlayerPortfolio(playerName);

		const stockValue = portfolio.reduce((total, stock) => {
			return total + this.tradingManager.calculateStockPrice(stock, indexes);
		}, 0);

		return cash + stockValue;
	}

	/**
	 * Get net worth for all players
	 */
	getAllNetWorths(indexes) {
		const netWorths = {};
		this.playerManager.getPlayers().forEach(playerName => {
			netWorths[playerName] = this.calculateNetWorth(playerName, indexes);
		});
		return netWorths;
	}

	/**
	 * Get player rankings sorted by net worth
	 */
	getPlayerRankings(indexes) {
		const players = this.playerManager.getPlayers();
		
		return players.map(playerName => ({
			name: playerName,
			cash: this.playerManager.getPlayerCash(playerName),
			netWorth: this.calculateNetWorth(playerName, indexes),
			stockCount: this.playerManager.getPlayerPortfolio(playerName).length
		})).sort((a, b) => b.netWorth - a.netWorth);
	}

	/**
	 * Determine game winners (handles ties)
	 */
	determineWinners(indexes) {
		const rankings = this.getPlayerRankings(indexes);
		
		if (rankings.length === 0) {
			return [];
		}

		const highestNetWorth = rankings[0].netWorth;
		return rankings.filter(p => p.netWorth === highestNetWorth);
	}

	/**
	 * Build end game message
	 */
	buildEndGameMessage(indexes) {
		const rankings = this.getPlayerRankings(indexes);
		const winners = this.determineWinners(indexes);

		let message = "🎉 GAME OVER - Rounds Complete! 🎉\n\n";

		// Winner announcement
		if (winners.length === 1) {
			message += `👑 WINNER: ${winners[0].name} 👑\n`;
			message += `Net Worth: $${winners[0].netWorth}\n\n`;
		} else {
			message += `👑 TIE - Winners: ${winners.map(w => w.name).join(', ')} 👑\n`;
			message += `Net Worth: $${winners[0].netWorth}\n\n`;
		}

		// Final standings
		message += "📊 Final Standings:\n";
		rankings.forEach((player, index) => {
			const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "  ";
			message += `${medal} ${index + 1}. ${player.name}\n`;
			message += `   💰 Cash: $${player.cash} | 📈 Net Worth: $${player.netWorth} | 📊 Stocks: ${player.stockCount}\n`;
		});

		return message;
	}

	/**
	 * Log game end to game log
	 */
	logGameEnd(indexes) {
		const winners = this.determineWinners(indexes);
		const winnerNames = winners.map(w => w.name).join(', ');
		this.logger.addToGameLog(`🎉 Game ended! Winner(s): ${winnerNames}`);
	}
}

module.exports = ScoreManager;

