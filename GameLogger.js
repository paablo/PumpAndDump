class GameLogger {
	constructor() {
		this.gameLog = [];
		this.roundNumber = 1;
	}

	/**
	 * Add entry to game log with timestamp
	 */
	addToGameLog(message, roundNumber = this.roundNumber) {
		this.gameLog.push({
			round: roundNumber,
			timestamp: new Date().toISOString(),
			message
		});
		console.log(`[Round ${roundNumber}] ${message}`);
	}

	/**
	 * Log event effects to game log
	 */
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

	/**
	 * Build dividend summary section
	 */
	buildDividendSummary(dividendPayments = []) {
		if (!dividendPayments || dividendPayments.length === 0) {
			return '';
		}
		
		let summary = `💰 Dividend Round (every even round)!:`;
		dividendPayments.forEach(payment => {
			summary += `\n  ${payment.playerName}: $${payment.totalDividends}`;
			// Optionally show breakdown
			if (payment.stockDividends.length > 0) {
				const breakdown = payment.stockDividends.map(sd => 
					`${sd.stockName} ($${sd.dividend})`
				).join(', ');
				summary += ` (${breakdown})`;
			}
		});
		
		return summary;
	}

	/**
	 * Build end-of-round roll results summary
	 */
	buildEndRoundRollsSummary(endRoundRolls = []) {
		if (!endRoundRolls || endRoundRolls.length === 0) {
			return '';
		}
		
		let summary = `📊 Previous Round Results:`;
		endRoundRolls.forEach(rollResult => {
			if (rollResult.triggered) {
				// Bubble popped - show the crash
				const changes = rollResult.results.map(r => {
					const sign = r.priceChange >= 0 ? '+' : '';
					return `${r.indexName} ${sign}${r.priceChange}`;
				}).join(', ');
				summary += `\n💥 ${rollResult.event.name} popped! ${changes}`;
			} else {
				// Bubble held - still active
				summary += `\n✓ ${rollResult.event.name} held (remains active)`;
			}
		});
		
		return summary;
	}

	/**
	 * Build newly drawn event summary
	 */
	buildNewEventSummary(newlyDrawnEvent) {
		if (!newlyDrawnEvent) {
			return '';
		}
		
		let summary = `📰 New Event: ${newlyDrawnEvent.name}`;
		summary += `\n${newlyDrawnEvent.description}`;
		
		// Check if this is an ongoing bubble
		const isOngoingBubble = newlyDrawnEvent.conditionalEffects && 
			newlyDrawnEvent.conditionalEffects.timing === 'end';
		
		// Show the effects (static amount only)
		if (newlyDrawnEvent.effects && newlyDrawnEvent.effects.length > 0) {
			const effectsSummary = newlyDrawnEvent.effects.map(eff => {
				const sign = eff.priceChange >= 0 ? '+' : '';
				return `${eff.indexName} ${sign}${eff.priceChange}`;
			}).join(', ');
			summary += `\n📊 ${effectsSummary}${isOngoingBubble ? ' (each round)' : ''}`;
		}
		
		// Show conditional effects if present (bubble pop risk - static amount)
		if (newlyDrawnEvent.conditionalEffects) {
			const condEffects = newlyDrawnEvent.conditionalEffects.effects.map(eff => {
				const sign = eff.priceChange >= 0 ? '+' : '';
				return `${eff.indexName} ${sign}${eff.priceChange}`;
			}).join(', ');
			
			let probability = '';
			if (newlyDrawnEvent.conditionalEffects.probability !== null) {
				probability = `${Math.round(newlyDrawnEvent.conditionalEffects.probability * 100)}%`;
			} else if (newlyDrawnEvent.conditionalEffects.dieRoll) {
				const dr = newlyDrawnEvent.conditionalEffects.dieRoll;
				const total = dr.max - dr.min + 1;
				const successCount = dr.success.length;
				probability = `${Math.round((successCount / total) * 100)}%`;
			}
			
			const timingText = newlyDrawnEvent.conditionalEffects.timing === 'end' 
				? 'At the end of this round' 
				: 'At the start of next round';
			
			summary += `\n⚠️ ${timingText}, ${probability} chance bubble pops: ${condEffects}`;
		}
		
		return summary;
	}

	/**
	 * Build active events list summary
	 */
	buildActiveEventsSummary(activeEvents = []) {
		const nonResolvedEvents = activeEvents.filter(e => e.status !== 'resolved');
		
		if (nonResolvedEvents.length === 0) {
			return '';
		}
		
		let summary = `🎪 Active Events:`;
		nonResolvedEvents.forEach(event => {
			let eventInfo = `  • ${event.name}`;
			
			// Show rounds active for bubbles
			if (event.roundsActive > 0) {
				eventInfo += ` (Round ${event.roundsActive})`;
			}
			
			summary += `\n${eventInfo}`;
		});
		
		return summary;
	}

	/**
	 * Build complete round summary message (combines all parts)
	 */
	buildRoundSummary(roundNumber, newlyDrawnEvent, endRoundRolls, activeEvents, dividendPayments = []) {
		const parts = [
			`🎲 Round ${roundNumber} begins!`,
			this.buildDividendSummary(dividendPayments),
			this.buildEndRoundRollsSummary(endRoundRolls),
			//this.buildNewEventSummary(newlyDrawnEvent),
			this.buildActiveEventsSummary(activeEvents)
		];
		
		// Filter out empty strings and join with double newlines
		return parts.filter(part => part !== '').join('\n\n');
	}
	/**
	 * Get recent log entries
	 */
	getRecentLog(count = 5) {
		return this.gameLog.slice(-count);
	}

	/**
	 * Update round number
	 */
	setRoundNumber(roundNumber) {
		this.roundNumber = roundNumber;
	}
}

module.exports = GameLogger;

