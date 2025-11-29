const Deck = require("./Deck");
const PlayingCard = require("./PlayingCard");
const StockCard = require("./StockCard");
const IndexCard = require("./IndexCard");
const EventCard = require("./EventCard");

class Room {
	constructor(name) {
		this.name = name;
		this.names = [];
		this.start = false;
		this.roundNumber = 1;
		this.playerCash = {};
		this.deck = null;
		this._turn = 0;
		this.stockDeck = [];
		// new: track 4 market indexes in addition to stock cards
		this.indexes = [];
		// event system
		this.eventDeck = null;
		this.activeEvents = []; // Events currently in play
		this.gameLog = []; // Log of important game events
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
		var playingCardDeck = PlayingCard.createDeck();
		this.deck = new Deck(playingCardDeck);
		var stockDeck = StockCard.createDeck();
		this.stockDeck = new Deck(stockDeck);

		// generate 4 market indexes using IndexCard factory
		this.indexes = IndexCard.createIndexes();

		// generate event deck
		var eventCards = EventCard.createDeck();
		this.eventDeck = new Deck(eventCards);
		this.activeEvents = [];
		this.gameLog = [];
		this.addToGameLog(`Game started with ${this.names.length} players`);

		const roomSet = io.sockets.adapter.rooms.get(this.name);
		if (!roomSet) return;

		const stocks = this.dealStocks();

		for (const playerSocketId of roomSet) {
			const card1 = this.deck.deal();
			const card2 = this.deck.deal();
			const card3 = this.deck.deal();
			const card4 = this.deck.deal();
			const cards = [card1, card2, card3, card4];
			console.log("Stocks:", JSON.stringify(stocks));
			console.log("Indexes:", JSON.stringify(this.indexes));
			const playerNames = this.names;
			io.to(playerSocketId).emit("start_variables", {
				cards,
				playerNames,
				playerCash: this.playerCash, // Send all players' cash
				stocks,
				// new: include indexes payload (frontend can read this)
				indexes: this.indexes,
				activeEvents: this.activeEvents.map(e => e.toJSON()),
				gameLog: this.gameLog
			});
		}
		io.in(this.name).emit("cash_update", this.playerCash);

		this._turn = 0;
		const current_room = Array.from(roomSet);
		io.in(this.name).emit(
			"your_turn",
			io.sockets.sockets.get(current_room[0]).nickname
		);
	}

	endGame(io, enderName) {
		this.start = false;
		io.in(this.name).emit("end_game", `${enderName} has ended the game!`);
		// cleanup (if needed) is left to the caller that manages Room instances
	}

	advanceTurn(io) {
		const roomSet = io.sockets.adapter.rooms.get(this.name);
		if (!roomSet || roomSet.size === 0) return;
		const roomSize = roomSet.size;

		// advance turn and detect wrap-around
		this._turn = (this._turn + 1) % roomSize;
		const current_room = Array.from(roomSet);
		io.in(this.name).emit(
			"your_turn",
			io.sockets.sockets.get(current_room[this._turn]).nickname
		);
		console.log("Turn", this._turn);
		console.log("Roomset", roomSet);

		// If we've wrapped to player 0, every player has had one turn -> increment round and deal new stocks
		if (this._turn === 0) {
			// END OF ROUND PROCESSING

			// 1. Process end-of-round conditional effects for active events
			this.processConditionalEvents("end", io);

			// 2. Draw and activate a new event
			this.drawAndActivateEvent(io);

			// 3. Process start-of-next-round events
			this.processConditionalEvents("start", io);

			// 4. Increment round
			this.roundNumber++;
			io.in(this.name).emit("round_update", this.roundNumber);

			// 5. Deal new stock cards for the room
			const stocks = this.dealStocks();

			// 6. Broadcast updates to all players
			io.in(this.name).emit("stocks_update", { 
				stocks, 
				indexes: this.indexes,
				activeEvents: this.activeEvents.map(e => e.toJSON()),
				gameLog: this.gameLog.slice(-10) // Send last 10 log entries
			});
			console.log("Dealt new stocks:", JSON.stringify(stocks));

			// 7. Send round summary message
			this.sendRoundSummary(io);
		}
	}

	// Get all stocks for a specific index/sector
	getStocksForIndex(indexName) {
		if (!this.stockDeck || !this.stockDeck.cards) return [];
		return this.stockDeck.cards.filter(stock => stock.industrySector === indexName);
	}

	// Get the index for a specific stock
	getIndexForStock(stock) {
		if (!stock || !this.indexes) return null;
		return this.indexes.find(idx => idx.name === stock.industrySector);
	}

	// Update index prices based on stock activity (can be called when stocks are traded)
	updateIndexPrices() {
		if (!this.indexes || !this.stockDeck) return;
		
		this.indexes.forEach(index => {
			const relatedStocks = index.getRelatedStocks(this.stockDeck.cards);
			if (relatedStocks.length > 0) {
				// Calculate new price based on sector performance
				const performance = index.getSectorPerformance(this.stockDeck.cards);
				// Gradually adjust index price towards sector performance
				const adjustment = Math.sign(performance - index.price);
				index.updatePrice(adjustment);
			}
		});
	}

	dealStocks(count = 3) {
		// ensure there are enough stock cards; reset/shuffle if low
		if (!this.stockDeck || typeof this.stockDeck.length !== "function" || this.stockDeck.length() < count) {
			if (this.stockDeck && typeof this.stockDeck.reset === "function") this.stockDeck.reset();
			if (this.stockDeck && typeof this.stockDeck.shuffle === "function") this.stockDeck.shuffle();
		}

		// deal N stock cards for the room
		const stocks = [];
		for (let i = 0; i < count; i++) {
			stocks.push(this.stockDeck.deal());
		}
		return stocks;
	}

	// Draw a new event and apply its initial effects
	drawAndActivateEvent(io) {
		if (!this.eventDeck || this.eventDeck.length() === 0) {
			// Reshuffle event deck if empty
			const eventCards = EventCard.createDeck();
			this.eventDeck = new Deck(eventCards);
		}

		const event = this.eventDeck.deal();
		if (!event) return;

		// Add to active events
		this.activeEvents.push(event);

		// Apply initial effects if timing is "start"
		if (event.timing === "start") {
			const results = event.applyEffects(this.indexes);
			this.logEventEffects(event, results, "Initial");
		}

		// Log the event
		this.addToGameLog(`📰 Event: ${event.name} - ${event.description}`);

		// Emit event notification to all players
		io.in(this.name).emit("event_played", {
			event: event.toJSON(),
			indexes: this.indexes
		});
	}

	// Process conditional effects for events based on timing
	processConditionalEvents(timing, io) {
		const eventsToRemove = [];

		for (let i = 0; i < this.activeEvents.length; i++) {
			const event = this.activeEvents[i];
			
			// Check if event has conditional effects with matching timing
			if (event.conditionalEffects && event.conditionalEffects.timing === timing) {
				const result = event.applyConditionalEffects(this.indexes);
				
				if (result.triggered) {
					// Log the conditional effect
					this.logEventEffects(event, result.results, "Conditional", result.roll);
					
					// Emit notification
					io.in(this.name).emit("event_triggered", {
						event: event.toJSON(),
						roll: result.roll,
						results: result.results,
						indexes: this.indexes
					});

					// Check if event should be discarded
					if (event.shouldDiscard()) {
						eventsToRemove.push(i);
						this.addToGameLog(`🗑️ Event discarded: ${event.name}`);
					}
				}
			}

			// Also apply non-conditional events with matching timing
			if (event.timing === timing && event.status === "pending") {
				const results = event.applyEffects(this.indexes);
				this.logEventEffects(event, results, "Applied");
			}
		}

		// Remove discarded events (iterate backwards to avoid index issues)
		for (let i = eventsToRemove.length - 1; i >= 0; i--) {
			this.activeEvents.splice(eventsToRemove[i], 1);
		}
	}

	// Log event effects to game log
	logEventEffects(event, results, effectType = "Effect", roll = null) {
		const changes = results.map(r => {
			if (r.error) return `${r.indexName}: ERROR`;
			const sign = r.priceChange >= 0 ? '+' : '';
			return `${r.indexName} ${sign}${r.priceChange} (${r.oldPrice}→${r.newPrice})`;
		}).join(', ');

		let logMessage = `📊 ${effectType} - ${event.name}: ${changes}`;
		if (roll !== null) {
			logMessage += ` [Roll: ${roll}]`;
		}

		this.addToGameLog(logMessage);
	}

	// Add entry to game log with timestamp
	addToGameLog(message) {
		this.gameLog.push({
			round: this.roundNumber,
			timestamp: new Date().toISOString(),
			message
		});
		console.log(`[Round ${this.roundNumber}] ${message}`);
	}

	// Send round summary to all players
	sendRoundSummary(io) {
		// Build summary message - exclude resolved events
		const nonResolvedEvents = this.activeEvents.filter(e => e.status !== 'resolved');
		
		let summaryMessage = `🎲 Round ${this.roundNumber} begins!`;
		
		if (nonResolvedEvents.length > 0) {
			summaryMessage += `\n🎪 Active Events:`;
			nonResolvedEvents.forEach(event => {
				summaryMessage += `\n  • ${event.name}`;
			});
		}

		// Emit round message
		io.in(this.name).emit("round_message", {
			round: this.roundNumber,
			message: summaryMessage,
			indexes: this.indexes,
			activeEvents: this.activeEvents.map(e => e.toJSON()),
			recentLog: this.gameLog.slice(-5) // Last 5 log entries
		});

		this.addToGameLog(`Round ${this.roundNumber} started`);
	}
}

module.exports = Room;
