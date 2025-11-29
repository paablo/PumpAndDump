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
	 * Build round summary message
	 */
	buildRoundSummary(roundNumber, newlyDrawnEvent, endRoundRolls, activeEvents) {
		let summaryMessage = `🎲 Round ${roundNumber} begins!`;
		
		// Add end-of-round roll results (if any)
		if (endRoundRolls && endRoundRolls.length > 0) {
			summaryMessage += `\n\n📊 Previous Round Results:`;
			endRoundRolls.forEach(rollResult => {
				if (rollResult.triggered) {
					// Bubble popped - show the crash
					const changes = rollResult.results.map(r => {
						const sign = r.priceChange >= 0 ? '+' : '';
						return `${r.indexName} ${sign}${r.priceChange}`;
					}).join(', ');
					summaryMessage += `\n💥 ${rollResult.event.name} popped! ${changes}`;
				} else {
					// Bubble held - still active
					summaryMessage += `\n✓ ${rollResult.event.name} held (remains active)`;
				}
			});
		}
		
		// Add newly drawn event information
		if (newlyDrawnEvent) {
			summaryMessage += `\n\n📰 New Event: ${newlyDrawnEvent.name}`;
			summaryMessage += `\n${newlyDrawnEvent.description}`;
			
			// Check if this is an ongoing bubble
			const isOngoingBubble = newlyDrawnEvent.conditionalEffects && 
				newlyDrawnEvent.conditionalEffects.timing === 'end';
			
			// Show the effects (static amount only)
			if (newlyDrawnEvent.effects && newlyDrawnEvent.effects.length > 0) {
				const effectsSummary = newlyDrawnEvent.effects.map(eff => {
					const sign = eff.priceChange >= 0 ? '+' : '';
					return `${eff.indexName} ${sign}${eff.priceChange}`;
				}).join(', ');
				summaryMessage += `\n📊 ${effectsSummary}${isOngoingBubble ? ' (each round)' : ''}`;
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
				
				summaryMessage += `\n⚠️ ${timingText}, ${probability} chance bubble pops: ${condEffects}`;
			}
		}
		
		// Build list of all active events
		const nonResolvedEvents = activeEvents.filter(e => e.status !== 'resolved');
		
		if (nonResolvedEvents.length > 0) {
			summaryMessage += `\n\n🎪 Active Events:`;
			nonResolvedEvents.forEach(event => {
				let eventInfo = `  • ${event.name}`;
				
				// Show rounds active for bubbles
				if (event.roundsActive > 0) {
					eventInfo += ` (Round ${event.roundsActive})`;
				}
				
				summaryMessage += `\n${eventInfo}`;
			});
		}

		return summaryMessage;
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

