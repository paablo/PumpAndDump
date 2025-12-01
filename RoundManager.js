/**
 * RoundManager - Handles round and turn progression
 */
class RoundManager {
	constructor(playerManager, eventManager, tradingManager, logger) {
		this.playerManager = playerManager;
		this.eventManager = eventManager;
		this.tradingManager = tradingManager;
		this.logger = logger;
		this.roundNumber = 1;
		this.currentTurn = 0;
		this.startingPlayerIndex = 0;
	}

	/**
	 * Get current round number
	 */
	getRoundNumber() {
		return this.roundNumber;
	}

	/**
	 * Get current turn index
	 */
	getCurrentTurn() {
		return this.currentTurn;
	}

	/**
	 * Advance to next player's turn
	 */
	advanceTurn(io, roomName) {
		const roomSet = io.sockets.adapter.rooms.get(roomName);
		if (!roomSet) return;

		const roomSize = roomSet.size;
		const currentRoom = Array.from(roomSet);
		var endOfRound = false;

		// Advance turn and detect wrap-around
		this.currentTurn = (this.currentTurn + 1) % roomSize;

		if (this.currentTurn === 0) {
			
			endOfRound = true;
			// Rotate players so players get to take turns going first (first player becomes last, second becomes first)
			this.playerManager.rotatePlayers();
		}


		const currentPlayerName = this.playerManager.getPlayers()[this.currentTurn];
		console.log(`It's ${currentPlayerName}'s turn, ${this.currentTurn} of ${roomSize}`);

		// Reset actions and stock action tracking for the new turn
		this.playerManager.resetPlayerActions(currentPlayerName, 2);

		io.in(roomName).emit("your_turn", currentPlayerName);
		io.in(roomName).emit("actions_update", {
			playerName: currentPlayerName,
			actionsRemaining: 2
		});

		return { endOfRound: endOfRound, currentPlayer: currentPlayerName };
	}

	/**
	 * Process end of round
	 */
	processEndOfRound(io, roomName, indexes, stockManager, maxRounds = 12) {
		// 1. Pay dividends on even-numbered rounds
		const dividendPayments = this.playerManager.processDividendPayments(this.roundNumber);
		
		// Log dividend payments
		dividendPayments.forEach(payment => {
			this.logger.addToGameLog(`💰 ${payment.playerName} received $${payment.totalDividends} in dividends`);
		});

		// 2. Clean up resolved start-timing events and clear previous round's pop effects
		const removedCount = this.eventManager.cleanupResolvedStartEvents();
		if (removedCount > 0) {
			this.logger.addToGameLog(`✓ ${removedCount} event(s) completed`);
			console.log(`Cleaned up ${removedCount} resolved start-timing event(s)`);
		}

		// 3. Process end-of-round conditional effects (check if bubbles pop)
		const endRoundRolls = this.eventManager.processConditionalEvents("end", indexes);
		this._logConditionalResults(endRoundRolls, io, roomName, indexes);

		// 4. Re-apply bubble effects for accumulation (bubbles grow each round)
		const bubbleGrowthResults = this.eventManager.reapplyBubbleEffects(indexes);
		bubbleGrowthResults.forEach(({ event, results }) => {
			if (results.length > 0) {
				this.logger.logEventEffects(event, results, "Bubble Growth");
				this.logger.addToGameLog(`📈 ${event.name} continues (Round ${event.roundsActive})`);
			}
		});

		// 5. Draw and activate new event
		const drawResult = this.eventManager.drawAndActivateEvent(indexes);
		const newEvent = drawResult ? drawResult.event : null;

		if (newEvent) {
			this.logger.addToGameLog(`📰 Event: ${newEvent.name} - ${newEvent.description}`);

			if (drawResult.results.length > 0) {
				this.logger.logEventEffects(newEvent, drawResult.results, "Initial");
			}

			io.in(roomName).emit("event_played", {
				event: newEvent.toJSON(),
				indexes: indexes
			});
		}

		// 6. Process start-of-next-round events
		const startRoundRolls = this.eventManager.processConditionalEvents("start", indexes);
		this._logConditionalResults(startRoundRolls, io, roomName, indexes);

		// 7. Increment round
		this.roundNumber++;
		this.logger.setRoundNumber(this.roundNumber);
		io.in(roomName).emit("round_update", this.roundNumber);

		// Check if game should end
		if (this.roundNumber > maxRounds) {
			return {
				gameEnded: true,
				dividendPayments,
				newEvent,
				endRoundRolls
			};
		}

		// 8. Update board stocks
		const stockUpdate = this.tradingManager.updateBoardStocks(stockManager);

		return {
			gameEnded: false,
			dividendPayments,
			newEvent,
			endRoundRolls,
			stockUpdate
		};
	}

	/**
	 * Log conditional event results
	 */
	_logConditionalResults(rollResults, io, roomName, indexes) {
		rollResults.forEach(rollResult => {
			if (rollResult.triggered) {
				// Bubble popped - log the crash and discard
				this.logger.logEventEffects(rollResult.event, rollResult.results, "Bubble Pop", rollResult.roll);
				this.logger.addToGameLog(`💥 ${rollResult.event.name} popped! (discarded)`);

				// Emit notification
				if (io) {
					io.in(roomName).emit("event_triggered", {
						event: rollResult.event.toJSON(),
						roll: rollResult.roll,
						results: rollResult.results,
						indexes: indexes
					});
				}
			} else {
				// Bubble held - stays active for next round
				this.logger.addToGameLog(`✓ ${rollResult.event.name} held (remains active)`);
			}
		});
	}

	/**
	 * Send round summary message
	 */
	sendRoundSummary(io, roomName, indexes, newEvent, endRoundRolls, dividendPayments) {
		const summaryMessage = this.logger.buildRoundSummary(
			this.roundNumber,
			newEvent,
			endRoundRolls,
			this.eventManager.activeEvents,
			dividendPayments
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
}

module.exports = RoundManager;

