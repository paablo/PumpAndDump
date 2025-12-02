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
		this.roundManager = new RoundManager(
			this.playerManager, 
			this.eventManager, 
			this.tradingManager, 
			this.logger,
			this.scoreManager  
		);
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
		this.stockManager.initialize();
		this.eventManager.initialize();
	
		// Generate indexes
		this.indexes = IndexCard.createIndexes();
	
		// Initialize logging
		this.logger.addToGameLog(`Game started with ${this.names.length} players`);
		this.logger.setRoundNumber(1);
	
		const roomSet = io.sockets.adapter.rooms.get(this.name);
		if (!roomSet) return;
	
		// Start Round 1 - deal stocks and draw first event
		const roundResult = this.roundManager.startRound(
			io, 
			this.name, 
			this.indexes, 
			this.stockManager,
			true  // isFirstRound = true
		);
	
		// Send initial state to all players
		for (const playerSocketId of roomSet) {
			io.to(playerSocketId).emit("start_variables", {
				cards: [],
				playerNames: this.names,
				playerCash: this.playerCash,
				stocks: this.tradingManager.getBoardStocks(),
				indexes: this.indexes,  // Already modified by event
				activeEvents: this.eventManager.getActiveEventsJSON(),
				visualEffects: this.eventManager.getVisualEffects(),
				gameLog: this.logger.gameLog,
				stockOwnershipCounts: this.playerManager.getStockOwnershipCounts()
			});
			const socket = io.sockets.sockets.get(playerSocketId);
			const msg = "Welcome to Pump and Dump " + socket.nickname + "! \r\n Finish the game with the highest net worth to win!";
			console.log(msg)
			this.broadcastMessage(io.to(playerSocketId), msg);
		}
		
		// Emit stocks_update to ensure frontend recalculates prices with modified indexes
		io.in(this.name).emit("stocks_update", {
			stocks: this.tradingManager.getBoardStocks(),
			indexes: this.indexes,
			activeEvents: this.eventManager.getActiveEventsJSON(),
			visualEffects: this.eventManager.getVisualEffects(),
			gameLog: this.logger.getRecentLog(10),
			stockOwnershipCounts: this.playerManager.getStockOwnershipCounts()
		});
	
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
		const result = this.roundManager.processRoundCycle(
			io, 
			this.name, 
			this.indexes, 
			this.stockManager,
			this.scoreManager,
			6 // max rounds
		);
	
		if (!result) return;
	
		// Handle game end
		if (result.gameEnded) {
			this._endGame(io);
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
