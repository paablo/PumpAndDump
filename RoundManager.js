/**
 * RoundManager - Handles round and turn progression
 */
class RoundManager {
	constructor(playerManager, eventManager, tradingManager, logger, scoreManager) {
		this.playerManager = playerManager;
		this.eventManager = eventManager;
		this.tradingManager = tradingManager;
		this.logger = logger;
		this.scoreManager = scoreManager;
		this.roundNumber = 1;
		this.currentTurn = 0;
		this.startingPlayerIndex = 0;
	}

	// ============ PUBLIC API ============

	getRoundNumber() {
		return this.roundNumber;
	}

	getCurrentTurn() {
		return this.currentTurn;
	}

	/**
	 * Execute start-of-round sequence
	 * Handles both Round 1 initialization and subsequent round starts
	 * - Round 1: Deal initial stocks, draw first event
	 * - Round 2+: Update stocks, grow bubbles, draw event, process conditional events
	 */
	startRound(io, roomName, indexes, stockManager, isFirstRound = false) {
		let stockUpdate;
		
		// 1. Handle stocks - initial deal for Round 1, update for subsequent rounds
		if (isFirstRound) {
			stockUpdate = this._dealInitialStocks(stockManager);
		} else {
			// Update board stocks (remove unpurchased, add new)
			stockUpdate = this.tradingManager.updateBoardStocks(stockManager);
			
			// Grow existing bubble events (only for Round 2+)
			this._processBubbleGrowth(indexes);
		}
		
		// 2. Draw and activate new event for this round
		const newEvent = this._drawNewEvent(io, roomName, indexes);
		
		// 3. Process start-of-round conditional events (only for Round 2+)
		if (!isFirstRound) {
			this._processStartOfRoundEvents(io, roomName, indexes);
		}
		
		return { newEvent, stockUpdate };
	}

	/**
	 * Main entry point for processing a turn
	 * Returns { gameEnded: boolean, currentPlayer: string }
	 */
	processRoundCycle(io, roomName, indexes, stockManager, scoreManager, maxRounds = 12, actionsPerTurn = 2) {
		const roomSet = io.sockets.adapter.rooms.get(roomName);
		if (!roomSet) return null;

		// Check if game should end before advancing turn
		if (this._shouldGameEnd(roomSet.size, maxRounds)) {
			return this._handleGameEnd(io, roomName, indexes, stockManager, maxRounds);
		}
		
		// Advance to next player's turn
		const turnResult = this.advanceTurn(io, roomName, actionsPerTurn);
		if (!turnResult) return null;

		// Update net worths after turn change
		this._emitNetWorthUpdate(io, roomName, indexes, scoreManager);

		// Handle mid-round vs end-of-round
		if (!turnResult.endOfRound) {
			return this._createTurnResult(false, turnResult.currentPlayer);
		}

		// Process end of round
		return this._handleEndOfRound(io, roomName, indexes, stockManager, scoreManager, maxRounds, turnResult.currentPlayer);
	}

	/**
	 * Advance to next player's turn
	 */
	advanceTurn(io, roomName, actionsPerTurn = 2) {
		const roomSet = io.sockets.adapter.rooms.get(roomName);
		if (!roomSet) return null;

		const roomSize = roomSet.size;
		this.currentTurn = (this.currentTurn + 1) % roomSize;
		const endOfRound = (this.currentTurn === 0);

		if (endOfRound) {
			this.playerManager.rotatePlayers();
		}

		const currentPlayerName = this._getCurrentPlayerName();
		console.log(`It's ${currentPlayerName}'s turn, ${this.currentTurn} of ${roomSize}`);

		this._resetPlayerForTurn(currentPlayerName, actionsPerTurn);
		this._emitTurnUpdates(io, roomName, currentPlayerName, actionsPerTurn);

		return { endOfRound, currentPlayer: currentPlayerName };
	}

	/**
	 * Send dividend message (if dividends were paid)
	 */
	sendDividendMessage(io, roomName, indexes, dividendPayments) {
		if (!dividendPayments || dividendPayments.length === 0) {
			return;
		}

		// Get player cash data to show in dividend summary
		const playerCash = this.playerManager.getAllCash();
		const dividendMessage = this.logger.buildDividendSummary(dividendPayments, playerCash);

		io.in(roomName).emit("round_message", {
			round: this.roundNumber,
			message: dividendMessage,
			indexes: indexes,
			activeEvents: this.eventManager.getActiveEventsJSON(),
			recentLog: this.logger.getRecentLog(5)
		});
	}

	/**
	 * Send round summary message
	 */
	sendRoundSummary(io, roomName, indexes, newEvent, endRoundRolls, dividendPayments) {
		// Build round summary WITHOUT dividends (they're sent separately)
		const summaryMessage = this.logger.buildRoundSummary(
			this.roundNumber,
			newEvent,
			endRoundRolls,
			this.eventManager.activeEvents,
			[], // Empty dividends array - dividends sent separately
			{}  // Empty playerCash - not needed for round summary
		);

		io.in(roomName).emit("round_message", {
			round: this.roundNumber,
			message: summaryMessage,
			indexes: indexes,
			activeEvents: this.eventManager.getActiveEventsJSON(),
			recentLog: this.logger.getRecentLog(5)
		});

		this.logger.addToGameLog(`Round ${this.roundNumber} started`);
	}

	// ============ PRIVATE GAME STATE CHECKS ============

	_shouldGameEnd(roomSize, maxRounds) {
		const wouldEndRound = ((this.currentTurn + 1) % roomSize === 0);
		return wouldEndRound && (this.roundNumber >= maxRounds);
	}

	_isGameOver(maxRounds) {
		return this.roundNumber > maxRounds;
	}

	// ============ PRIVATE TURN MANAGEMENT ============

	_getCurrentPlayerName() {
		return this.playerManager.getPlayers()[this.currentTurn];
	}

	_resetPlayerForTurn(playerName, actionsPerTurn) {
		this.playerManager.resetPlayerActions(playerName, actionsPerTurn);
	}

	_emitTurnUpdates(io, roomName, playerName, actionsPerTurn) {
		io.in(roomName).emit("your_turn", playerName);
		io.in(roomName).emit("actions_update", {
			playerName: playerName,
			actionsRemaining: actionsPerTurn
		});
	}

	_emitNetWorthUpdate(io, roomName, indexes, scoreManager) {
		io.in(roomName).emit("net_worth_update", scoreManager.getAllNetWorths(indexes));
	}

	// ============ PRIVATE ROUND ORCHESTRATION ============

	_handleGameEnd(io, roomName, indexes, stockManager, maxRounds) {
		const roundResult = this._executeEndOfRoundSequence(io, roomName, indexes, maxRounds);
		
		return {
			gameEnded: true,
			currentPlayer: this._getCurrentPlayerName(),
			...roundResult
		};
	}

// Around line 177 - update this call
_handleEndOfRound(io, roomName, indexes, stockManager, scoreManager, maxRounds, currentPlayer) {
	// Process END of current round
	const endRoundResult = this._executeEndOfRoundSequence(io, roomName, indexes, maxRounds);

	if (endRoundResult.gameEnded) {
		return this._createTurnResult(true, currentPlayer, endRoundResult);
	}

	// Process START of next round - use startRound() instead
	const startRoundResult = this.startRound(io, roomName, indexes, stockManager, false);

	// Broadcast all updates
	this._broadcastRoundTransitionUpdates(io, roomName, indexes, scoreManager, endRoundResult, startRoundResult);
	
	return this._createTurnResult(false, currentPlayer, { ...endRoundResult, ...startRoundResult });
}
	
	_createTurnResult(gameEnded, currentPlayer, roundResult = {}) {
		return {
			gameEnded,
			currentPlayer,
			...roundResult
		};
	}
	
	// ============ PRIVATE END-OF-ROUND SEQUENCE ============
	
	/**
	 * Execute end-of-round sequence (happens when current round ends)
	 * - Pay dividends
	 * - Clean up expired events
	 * - Check if bubbles pop
	 * - Increment round (or end game)
	 */
	_executeEndOfRoundSequence(io, roomName, indexes, maxRounds) {
		// 1. Pay dividends on even-numbered rounds
		const dividendPayments = this._processDividends();
		
		// 2. Clean up resolved events from previous rounds
		this._cleanupEvents();
		
		// 3. Check if bubbles pop (end-of-round conditional events)
		const endRoundRolls = this._processEndOfRoundEvents(io, roomName, indexes);
		
		// 4. Check if game should end BEFORE incrementing round
		if (this.roundNumber >= maxRounds) {
			// Game is ending - don't increment round
			return { gameEnded: true, dividendPayments, endRoundRolls };
		}
		
		// 5. Game continues - advance to next round
		this._advanceRound(io, roomName);
		
		return { gameEnded: false, dividendPayments, endRoundRolls };
	}
	
	
	// ============ PRIVATE PROCESSING METHODS ============
	
	/**
	 * Deal initial stocks for Round 1
	 */
	_dealInitialStocks(stockManager) {
		const initialStocks = stockManager.dealStocks();
		initialStocks.forEach(stock => stock.isCarryover = false);
		this.tradingManager.setBoardStocks(initialStocks);
		return initialStocks;
	}
	
	/**
	 * Draw and log event (shared between Round 1 and subsequent rounds)
	 * @param {boolean} emitEvent - Whether to emit event_played event (true for subsequent rounds, false for Round 1)
	 */
	_drawAndLogEvent(io, roomName, indexes, emitEvent = true) {
		const drawResult = this.eventManager.drawAndActivateEvent(indexes);
		const event = drawResult ? drawResult.event : null;
	
		if (event) {
			this.logger.addToGameLog(`📰 Event: ${event.name} - ${event.description}`);
	
			if (drawResult.results.length > 0) {
				this.logger.logEventEffects(event, drawResult.results, "Initial");
			}
	
			if (emitEvent && io) {
				io.in(roomName).emit("event_played", {
					event: event.toJSON(),
					indexes: indexes
				});
			}
		}
	
		return event;
	}
	
	_processDividends() {
		const dividendPayments = this.playerManager.processDividendPayments(this.roundNumber);
		
		dividendPayments.forEach(payment => {
			this.logger.addToGameLog(`💰 ${payment.playerName} received $${payment.totalDividends} in dividends`);
		});
	
		return dividendPayments;
	}
	
	_cleanupEvents() {
		const removedCount = this.eventManager.cleanupResolvedStartEvents();
		if (removedCount > 0) {
			this.logger.addToGameLog(`✓ ${removedCount} event(s) completed`);
			console.log(`Cleaned up ${removedCount} resolved start-timing event(s)`);
		}
	}
	
	_processEndOfRoundEvents(io, roomName, indexes) {
		const endRoundRolls = this.eventManager.processConditionalEvents("end", indexes);
		this._logConditionalResults(endRoundRolls, io, roomName, indexes);
		return endRoundRolls;
	}
	
	_processBubbleGrowth(indexes) {
		const bubbleGrowthResults = this.eventManager.reapplyBubbleEffects(indexes);
		bubbleGrowthResults.forEach(({ event, results }) => {
			if (results.length > 0) {
				this.logger.logEventEffects(event, results, "Bubble Growth");
				this.logger.addToGameLog(`📈 ${event.name} continues (Round ${event.roundsActive})`);
			}
		});
	}
	
	_drawNewEvent(io, roomName, indexes) {
		// Use shared event drawing logic (with emit enabled for subsequent rounds)
		return this._drawAndLogEvent(io, roomName, indexes, true);
	}
	
	_processStartOfRoundEvents(io, roomName, indexes) {
		const startRoundRolls = this.eventManager.processConditionalEvents("start", indexes);
		this._logConditionalResults(startRoundRolls, io, roomName, indexes);
	}
	
	_advanceRound(io, roomName) {
		this.roundNumber++;
		this.logger.setRoundNumber(this.roundNumber);
		io.in(roomName).emit("round_update", this.roundNumber);
	}
	
	// ============ PRIVATE BROADCASTING ============
	
	/**
	 * Broadcast updates for round transition (end of old round + start of new round)
	 */
	_broadcastRoundTransitionUpdates(io, roomName, indexes, scoreManager, endRoundResult, startRoundResult) {
		// Broadcast stock updates
		this._broadcastStockUpdates(io, roomName, indexes);
		
		// Broadcast cash updates if dividends were paid
		if (endRoundResult.dividendPayments?.length > 0) {
			this._broadcastCashUpdates(io, roomName, indexes, scoreManager);
		}
		
		// Send dividend message FIRST (if dividends were paid)
		// Use setTimeout to ensure it's sent before the round message
		if (endRoundResult.dividendPayments?.length > 0) {
			this.sendDividendMessage(io, roomName, indexes, endRoundResult.dividendPayments);
			
			// Send round summary AFTER a short delay to ensure dividend message shows first
			setTimeout(() => {
				this.sendRoundSummary(
					io, 
					roomName, 
					indexes, 
					startRoundResult.newEvent,  // Event for the NEW round
					endRoundResult.endRoundRolls,  // Bubble pops from old round
					endRoundResult.dividendPayments  // Passed but not included in message (sent separately)
				);
			}, 100); // 100ms delay
		} else {
			// No dividends - send round summary immediately
			this.sendRoundSummary(
				io, 
				roomName, 
				indexes, 
				startRoundResult.newEvent,
				endRoundResult.endRoundRolls,
				endRoundResult.dividendPayments
			);
		}
	}
	
	// ... rest of the broadcasting and logging methods stay the same ...

	_broadcastStockUpdates(io, roomName, indexes) {
		io.in(roomName).emit("stocks_update", { 
			stocks: this.tradingManager.getBoardStocks(), 
			indexes: indexes,
			activeEvents: this.eventManager.getActiveEventsJSON(),
			visualEffects: this.eventManager.getVisualEffects(),
			gameLog: this.logger.getRecentLog(10),
			stockOwnershipCounts: this.playerManager.getStockOwnershipCounts(),
			stockOwnershipByPlayer: this.playerManager.getAllStockOwnershipByPlayer()
		});
	}

	_broadcastCashUpdates(io, roomName, indexes, scoreManager) {
		io.in(roomName).emit("cash_update", this.playerManager.getAllCash());
		io.in(roomName).emit("net_worth_update", scoreManager.getAllNetWorths(indexes));
	}

	// ============ PRIVATE LOGGING ============

	_logConditionalResults(rollResults, io, roomName, indexes) {
		rollResults.forEach(rollResult => {
			if (rollResult.triggered) {
				this._logBubblePop(rollResult, io, roomName, indexes);
			} else {
				this.logger.addToGameLog(`✓ ${rollResult.event.name} held (remains active)`);
			}
		});
	}

	_logBubblePop(rollResult, io, roomName, indexes) {
		this.logger.logEventEffects(rollResult.event, rollResult.results, "Event Ended", rollResult.roll);
		this.logger.addToGameLog(`💥 ${rollResult.event.name} ended! (discarded)`);

		if (io) {
			io.in(roomName).emit("event_triggered", {
				event: rollResult.event.toJSON(),
				roll: rollResult.roll,
				results: rollResult.results,
				indexes: indexes
			});
		}
	}
}

module.exports = RoundManager;