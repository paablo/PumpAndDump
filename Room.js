const Deck = require("./Deck");
const PlayingCard = require("./PlayingCard");
const IndexCard = require("./IndexCard");
const EventManager = require("./EventManager");
const StockManager = require("./StockManager");
const ActionManager = require("./ActionManager");
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
		
		// Game configuration constants
		this.maxActionsPerTurn = 3; // Number of actions each player gets per turn
		this.maxRounds = 6; // Maximum number of rounds in the game
		
		// Initialize manager classes
		this.logger = new GameLogger();
		this.playerManager = new PlayerManager();
		this.eventManager = new EventManager();
		this.stockManager = new StockManager();
		this.actionManager = new ActionManager();
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
		this.actionManager.initialize();
	
		// Deal initial action cards to each player (2 cards each)
		this.names.forEach(playerName => {
			const initialActions = this.actionManager.drawMultipleCards(2);
			console.log(`Dealing ${initialActions.length} action cards to ${playerName}`);
			initialActions.forEach(card => {
				console.log(`  - Card: ${card.name} (${card.actionType})`);
				this.playerManager.addActionCard(playerName, card);
			});
		});
	
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
			const socket = io.sockets.sockets.get(playerSocketId);
			const playerName = socket.nickname;
			const playerActionCards = this.playerManager.getPlayerActionCards(playerName);
			console.log(`Sending ${playerActionCards.length} action cards to ${playerName}`);
			io.to(playerSocketId).emit("start_variables", {
				cards: [],
				playerNames: this.names,
				playerCash: this.playerCash,
				stocks: this.tradingManager.getBoardStocks(),
				indexes: this.indexes,  // Already modified by event
				activeEvents: this.eventManager.getActiveEventsJSON(),
				visualEffects: this.eventManager.getVisualEffects(),
				gameLog: this.logger.gameLog,
				stockOwnershipCounts: this.playerManager.getStockOwnershipCounts(),
				stockOwnershipByPlayer: this.getAllStockOwnershipByPlayer(),
				playerColors: this.getPlayerColors(),
				playerEmojis: this.getPlayerEmojis(),
				maxActionsPerTurn: this.maxActionsPerTurn,
				actionCards: playerActionCards.map(card => card.toJSON ? card.toJSON() : card)
			});
		}
		
		// Emit stocks_update to ensure frontend recalculates prices with modified indexes
		io.in(this.name).emit("stocks_update", {
			stocks: this.tradingManager.getBoardStocks(),
			indexes: this.indexes,
			activeEvents: this.eventManager.getActiveEventsJSON(),
			visualEffects: this.eventManager.getVisualEffects(),
			gameLog: this.logger.getRecentLog(10),
			stockOwnershipCounts: this.playerManager.getStockOwnershipCounts(),
			stockOwnershipByPlayer: this.getAllStockOwnershipByPlayer()
		});
	
		io.in(this.name).emit("cash_update", this.playerCash);
		io.in(this.name).emit("net_worth_update", this.scoreManager.getAllNetWorths(this.indexes));
		console.log(`Players: ${this.names}`);
		this.playerManager.shufflePlayers();
		console.log(`Players: ${this.names}`);
		const currentPlayerName = this.names[0];
		console.log(`Current player name: ${currentPlayerName}`);
		
		// Reset actions for first player
		this.playerManager.resetPlayerActions(currentPlayerName, this.maxActionsPerTurn);
		io.in(this.name).emit("your_turn", currentPlayerName);
		io.in(this.name).emit("actions_update", {
			playerName: currentPlayerName,
			actionsRemaining: this.maxActionsPerTurn
		});
	
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
			this.maxRounds,
			this.maxActionsPerTurn
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

	getAllStockOwnershipByPlayer() {
		return this.playerManager.getAllStockOwnershipByPlayer();
	}

	getPlayerColors() {
		return this.playerManager.getAllPlayerColors();
	}

	getPlayerEmojis() {
		return this.playerManager.getAllPlayerEmojis();
	}

	getAllPlayerNetWorths() {
		return this.scoreManager.getAllNetWorths(this.indexes);
	}

	/**
	 * Play an action card
	 * Extensible design: ActionCard.execute() handles all action types
	 */
	playActionCard(playerName, cardId, target = null, direction = null) {
		// Validate player has actions remaining
		if (!this.playerManager.hasActionsRemaining(playerName)) {
			return { success: false, message: "No actions left this turn" };
		}

		// Get the action card from player's hand
		const actionCard = this.playerManager.getActionCardById(playerName, cardId);
		
		if (!actionCard) {
			return { success: false, message: "Action card not found in your hand" };
		}

		// Build context for action execution
		const context = {
			playerName,
			eventManager: this.eventManager,
			tradingManager: this.tradingManager,
			indexes: this.indexes,
			roundNumber: this.roundNumber,
			stock: target,
			direction: direction
		};

		// Execute the action (delegated to ActionCard class)
		const result = this.actionManager.executeAction(actionCard, context);
		
		if (result.success) {
			// Remove card from player's hand
			this.playerManager.removeActionCard(playerName, cardId);
			// Consume an action
			this.playerManager.consumeAction(playerName);
			// Log the action
			this.logger.addToGameLog(`🎴 ${playerName} played ${actionCard.name}`);
			
			// If action was applied to a stock, track it
			console.log('[Room.playActionCard] Checking if should track:', { 
				hasTarget: !!target, 
				hasResultData: !!result.data, 
				hasStockName: !!(result.data && result.data.stockName),
				targetName: target ? target.name : null,
				resultData: result.data
			});
			
			if (target && result.data && result.data.stockName) {
				console.log('[Room.playActionCard] Tracking action card on stock:', target.name);
				this.tradingManager.addAppliedActionCard(target.name, {
					name: actionCard.name,
					actionType: actionCard.actionType,
					effectValue: actionCard.effectValue,
					playerName: playerName
				});
			} else {
				console.log('[Room.playActionCard] NOT tracking - conditions not met');
			}
		}
		
		return result;
	}

	/**
	 * Draw a new action card for a player
	 * Costs one action
	 */
	drawActionCard(playerName) {
		// Validate player has actions remaining
		if (!this.playerManager.hasActionsRemaining(playerName)) {
			return { success: false, message: "No actions left this turn" };
		}

		// Check if player's hand is full (max 4 cards)
		const currentCards = this.playerManager.getActionCardCount(playerName);
		if (currentCards >= 4) {
			return { success: false, message: "Your hand is full! You can only hold 4 action cards." };
		}

		// Check if action deck has cards
		if (this.actionManager.isActionDeckEmpty()) {
			return { success: false, message: "No action cards left in deck" };
		}

		// Draw a card
		const newCard = this.actionManager.drawActionCard();
		
		if (!newCard) {
			return { success: false, message: "Failed to draw action card" };
		}

		// Add to player's hand
		this.playerManager.addActionCard(playerName, newCard);
		
		// Consume an action
		this.playerManager.consumeAction(playerName);
		
		// Log the action
		this.logger.addToGameLog(`🃏 ${playerName} drew an action card`);

		return {
			success: true,
			message: `Drew ${newCard.name}`,
			card: newCard.toJSON(),
			actionsRemaining: this.playerManager.playerActionsRemaining[playerName]
		};
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
