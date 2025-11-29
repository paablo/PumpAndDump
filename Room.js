const Deck = require("./Deck");
const PlayingCard = require("./PlayingCard");
const IndexCard = require("./IndexCard");
const EventManager = require("./EventManager");
const StockManager = require("./StockManager");
const GameLogger = require("./GameLogger");

class Room {
	constructor(name) {
		this.name = name;
		this.names = [];
		this.start = false;
		this.roundNumber = 1;
		this.playerCash = {};
		this.deck = null;
		this._turn = 0;
		this.indexes = [];
		
		// Use manager classes
		this.eventManager = new EventManager();
		this.stockManager = new StockManager();
		this.logger = new GameLogger();
	}

	addPlayer(name) {
		if (!this.names.includes(name)) this.names.push(name);
		if (this.playerCash[name] === undefined) this.playerCash[name] = 30;
	}

	removePlayer(name) {
		const idx = this.names.indexOf(name);
		if (idx !== -1) this.names.splice(idx, 1);
		if (this.playerCash && this.playerCash[name] !== undefined) {
			delete this.playerCash[name];
		}
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
		
		// Initialize logging
		this.logger.addToGameLog(`Game started with ${this.names.length} players`);

		const roomSet = io.sockets.adapter.rooms.get(this.name);
		if (!roomSet) return;

		const stocks = this.stockManager.dealStocks();

		// Send initial state to all players
		for (const playerSocketId of roomSet) {
			const cards = [];
			console.log("Stocks:", JSON.stringify(stocks));
			console.log("Indexes:", JSON.stringify(this.indexes));
			console.log("Active Events:", JSON.stringify(this.eventManager.activeEvents));
			
			io.to(playerSocketId).emit("start_variables", {
				cards,
				playerNames: this.names,
				playerCash: this.playerCash,
				stocks,
				indexes: this.indexes,
				activeEvents: this.eventManager.getActiveEventsJSON(),
				gameLog: this.logger.gameLog
			});
		}
		
		io.in(this.name).emit("cash_update", this.playerCash);

		// Start first turn
		this._turn = 0;
		const current_room = Array.from(roomSet);
		io.in(this.name).emit("your_turn", io.sockets.sockets.get(current_room[0]).nickname);
	}

	endGame(io, enderName) {
		this.start = false;
		io.in(this.name).emit("end_game", `${enderName} has ended the game!`);
	}

	advanceTurn(io) {
		const roomSet = io.sockets.adapter.rooms.get(this.name);
		if (!roomSet || roomSet.size === 0) return;
		const roomSize = roomSet.size;

		// Advance turn and detect wrap-around
		this._turn = (this._turn + 1) % roomSize;
		const current_room = Array.from(roomSet);
		io.in(this.name).emit("your_turn", io.sockets.sockets.get(current_room[this._turn]).nickname);
		
		console.log("Turn", this._turn);
		console.log("Roomset", roomSet);

		// End of round processing
		if (this._turn === 0) {
			this._processEndOfRound(io);
		}
	}

	_processEndOfRound(io) {
		// 1. Clean up resolved start-timing events and clear previous round's pop effects
		const removedCount = this.eventManager.cleanupResolvedStartEvents();
		if (removedCount > 0) {
			this.logger.addToGameLog(`✓ ${removedCount} event(s) completed`);
			console.log(`Cleaned up ${removedCount} resolved start-timing event(s)`);
		}

		// 2. Process end-of-round conditional effects (check if bubbles pop)
		const endRoundRolls = this.eventManager.processConditionalEvents("end", this.indexes);
		this._logConditionalResults(endRoundRolls, io);

		// 3. Re-apply bubble effects for accumulation (bubbles grow each round)
		const bubbleGrowthResults = this.eventManager.reapplyBubbleEffects(this.indexes);
		bubbleGrowthResults.forEach(({ event, results }) => {
			if (results.length > 0) {
				this.logger.logEventEffects(event, results, "Bubble Growth");
				this.logger.addToGameLog(`📈 ${event.name} continues (Round ${event.roundsActive})`);
			}
		});

		// 4. Draw and activate new event
		const drawResult = this.eventManager.drawAndActivateEvent(this.indexes);
		const newEvent = drawResult ? drawResult.event : null;
		
		if (newEvent) {
			this.logger.addToGameLog(`📰 Event: ${newEvent.name} - ${newEvent.description}`);
			
			if (drawResult.results.length > 0) {
				this.logger.logEventEffects(newEvent, drawResult.results, "Initial");
			}
			
			io.in(this.name).emit("event_played", {
				event: newEvent.toJSON(),
				indexes: this.indexes
			});
		}

		// 5. Process start-of-next-round events
		const startRoundRolls = this.eventManager.processConditionalEvents("start", this.indexes);
		this._logConditionalResults(startRoundRolls, io);

		// 6. Increment round
		this.roundNumber++;
		this.logger.setRoundNumber(this.roundNumber);
		io.in(this.name).emit("round_update", this.roundNumber);

		// 7. Deal new stock cards
		const stocks = this.stockManager.dealStocks();

		// 8. Broadcast updates
		io.in(this.name).emit("stocks_update", { 
			stocks, 
			indexes: this.indexes,
			activeEvents: this.eventManager.getActiveEventsJSON(),
			visualEffects: this.eventManager.getVisualEffects(),
			gameLog: this.logger.getRecentLog(10)
		});
		console.log("Dealt new stocks:", JSON.stringify(stocks));

		// 9. Send round summary message
		this._sendRoundSummary(io, newEvent, endRoundRolls);
	}

	_logConditionalResults(rollResults, io = null) {
		rollResults.forEach(rollResult => {
			if (rollResult.triggered) {
				// Bubble popped - log the crash and discard
				this.logger.logEventEffects(rollResult.event, rollResult.results, "Bubble Pop", rollResult.roll);
				this.logger.addToGameLog(`💥 ${rollResult.event.name} popped! (discarded)`);
				
				// Emit notification if io provided
				if (io) {
					io.in(this.name).emit("event_triggered", {
						event: rollResult.event.toJSON(),
						roll: rollResult.roll,
						results: rollResult.results,
						indexes: this.indexes
					});
				}
			} else {
				// Bubble held - stays active for next round
				this.logger.addToGameLog(`✓ ${rollResult.event.name} held (remains active)`);
			}
		});
	}

	_sendRoundSummary(io, newlyDrawnEvent, endRoundRolls) {
		const summaryMessage = this.logger.buildRoundSummary(
			this.roundNumber,
			newlyDrawnEvent,
			endRoundRolls,
			this.eventManager.activeEvents
		);

		io.in(this.name).emit("round_message", {
			round: this.roundNumber,
			message: summaryMessage,
			indexes: this.indexes,
			activeEvents: this.eventManager.getActiveEventsJSON(),
			recentLog: this.logger.getRecentLog(5)
		});

		this.logger.addToGameLog(`Round ${this.roundNumber} started`);
	}

	// Utility methods for external use
	getStocksForIndex(indexName) {
		return this.stockManager.getStocksForIndex(indexName);
	}

	getIndexForStock(stock) {
		if (!stock || !this.indexes) return null;
		return this.indexes.find(idx => idx.name === stock.industrySector);
	}

	updateIndexPrices() {
		this.stockManager.updateIndexPrices(this.indexes);
	}
}

module.exports = Room;
