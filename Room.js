const Deck = require("./Deck");
const PlayingCard = require("./PlayingCard");
const IndexCard = require("./IndexCard");
const EventManager = require("./EventManager");
const StockManager = require("./StockManager");
const GameLogger = require("./GameLogger");
const PlayerManager = require("./PlayerManager");
const TradingManager = require("./TradingManager");
const ScoreManager = require("./ScoreManager");
const RoundManager = require("./RoundManager");

class Room {
	constructor(name) {
		this.name = name;
		this.start = false;
		this.deck = null;
		this.indexes = [];
		
		// Initialize manager classes
		this.logger = new GameLogger();
		this.playerManager = new PlayerManager();
		this.eventManager = new EventManager();
		this.stockManager = new StockManager();
		this.tradingManager = new TradingManager(this.playerManager, this.logger);
		this.scoreManager = new ScoreManager(this.playerManager, this.tradingManager, this.logger);
		this.roundManager = new RoundManager(this.playerManager, this.eventManager, this.tradingManager, this.logger);
	}

	// Delegate player management to PlayerManager
	get names() {
		return this.playerManager.getPlayers();
	}

	get playerCash() {
		return this.playerManager.getAllCash();
	}

	get roundNumber() {
		return this.roundManager.getRoundNumber();
	}

	get _turn() {
		return this.roundManager.getCurrentTurn();
	}

	set _turn(value) {
		this.roundManager.currentTurn = value;
	}

	addPlayer(name) {
		this.playerManager.addPlayer(name, 40);
	}

	removePlayer(name) {
		this.playerManager.removePlayer(name);
	}

	startGame(io) {
		this.start = true;
		
		// Initialize decks
		const playingCardDeck = PlayingCard.createDeck();
		this.deck = new Deck(playingCardDeck);
		this.stockManager.initialize();
		this.eventManager.initialize();

		// Generate indexes
		this.indexes = IndexCard.createIndexes();
		//console.log(`Players: ${this.names}`);
		//this.playerManager.shufflePlayers();

		// Initialize logging
		this.logger.addToGameLog(`Game started with ${this.names.length} players`);

		const roomSet = io.sockets.adapter.rooms.get(this.name);
		if (!roomSet) return;

		// Deal initial stocks
		const initialStocks = this.stockManager.dealStocks();
		initialStocks.forEach(stock => stock.isCarryover = false);
		this.tradingManager.setBoardStocks(initialStocks);

		// Send initial state to all players
		for (const playerSocketId of roomSet) {
			io.to(playerSocketId).emit("start_variables", {
				cards: [],
				playerNames: this.names,
				playerCash: this.playerCash,
				stocks: this.tradingManager.getBoardStocks(),
				indexes: this.indexes,
				activeEvents: this.eventManager.getActiveEventsJSON(),
				gameLog: this.logger.gameLog,
				stockOwnershipCounts: this.playerManager.getStockOwnershipCounts()
			});
			const socket = io.sockets.sockets.get(playerSocketId);
			const msg = "Welcome to Pump and Dump " + socket.nickname + "! \r\n Finish the game with the highest net worth to win!";
			console.log(msg)
			this.broadcastMessage(io.to(playerSocketId), msg);
		}
		
		io.in(this.name).emit("cash_update", this.playerCash);
		io.in(this.name).emit("net_worth_update", this.scoreManager.getAllNetWorths(this.indexes));
		console.log(`Players: ${this.names}`);
		this.playerManager.shufflePlayers();
		console.log(`Players: ${this.names}`);
		const currentPlayerName = this.names[0];
		console.log(`Current player name: ${currentPlayerName}`);
		io.in(this.name).emit("your_turn", currentPlayerName);

		console.log(`Game started in room: ${this.name}`);
		
	}

	broadcastMessage(ioTo, msg="Hello World") {
		ioTo.emit("show_message", 
			msg
		);
	}

	advanceTurn(io) {
		/* Phases 
		Event?
		1. Trade 
		2. Dividends
		
		Resolve event
		4. Net worth update

		*/
		const turnResult = this.roundManager.advanceTurn(io, this.name,this.indexes, this.stockManager);
		if (!turnResult) return;

		// Send updated net worths
		io.in(this.name).emit("net_worth_update", this.scoreManager.getAllNetWorths(this.indexes));

		// End of round processing
		if (turnResult.endOfRound) {
			const roundResult = this.roundManager.processEndOfRound(
				io, 
				this.name, 
				this.indexes, 
				this.stockManager,
				6 // max rounds (changed from 12 by user)
			);

			if (roundResult.gameEnded) {
				this._endGame(io);
				return;
			}

			// Broadcast stock updates
			io.in(this.name).emit("stocks_update", { 
				stocks: this.tradingManager.getBoardStocks(), 
				indexes: this.indexes,
				activeEvents: this.eventManager.getActiveEventsJSON(),
				visualEffects: this.eventManager.getVisualEffects(),
				gameLog: this.logger.getRecentLog(10),
				stockOwnershipCounts: this.playerManager.getStockOwnershipCounts()
			});

			// Broadcast cash updates if dividends were paid
			if (roundResult.dividendPayments.length > 0) {
				io.in(this.name).emit("cash_update", this.playerCash);
				io.in(this.name).emit("net_worth_update", this.scoreManager.getAllNetWorths(this.indexes));
			}

			// Send round summary
			this.roundManager.sendRoundSummary(
				io, 
				this.name, 
				this.indexes, 
				roundResult.newEvent, 
				roundResult.endRoundRolls, 
				roundResult.dividendPayments
			);
		}
	}

	purchaseStock(playerName, stock) {
		const result = this.tradingManager.purchaseStock(
			playerName, 
			stock, 
			this.indexes, 
			this.roundNumber
		);
		return result;
	}

	sellStock(playerName, stock) {
		const result = this.tradingManager.sellStock(
			playerName, 
			stock, 
			this.indexes
		);
		return result;
	}

	getStockOwnershipCounts() {
		return this.playerManager.getStockOwnershipCounts();
	}

	getAllPlayerNetWorths() {
		return this.scoreManager.getAllNetWorths(this.indexes);
	}

	_endGame(io) {
		const message = this.scoreManager.buildEndGameMessage(this.indexes);
		this.scoreManager.logGameEnd(this.indexes);

		// Emit end game event
		io.in(this.name).emit("end_game", message);
		
		const winners = this.scoreManager.determineWinners(this.indexes);
		console.log("Game ended. Winner(s):", winners.map(w => w.name).join(', '));
	}
}

module.exports = Room;
