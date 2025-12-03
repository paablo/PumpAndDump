const Deck = require("./Deck");
const EventCard = require("./EventCard");

class EventManager {
	constructor() {
		this.eventDeck = null;
		this.activeEvents = [];
		this.recentPopEffects = []; // Track bubble pop effects for visual display
	}

	initialize() {
		const eventCards = EventCard.createDeck();
		this.eventDeck = new Deck(eventCards);
		this.activeEvents = [];
		this.recentPopEffects = [];
	}

	/**
	 * Draw a new event and apply its initial effects
	 * @returns {EventCard|null} The drawn event
	 */
	drawAndActivateEvent(indexes) {
		if (!this.eventDeck || this.eventDeck.length() === 0) {
			const eventCards = EventCard.createDeck();
			this.eventDeck = new Deck(eventCards);
		}

		const event = this.eventDeck.deal();
		if (!event) return null;

		this.activeEvents.push(event);

		// Apply initial effects if timing is "start"
		if (event.timing === "start") {
			const results = event.applyEffects(indexes);
			// For bubbles, mark first round of accumulation
			if (event.conditionalEffects && event.status === "active") {
				event.roundsActive = 1;
			}
			return { event, results };
		}

		return { event, results: [] };
	}

	/**
	 * Re-apply bubble effects at the start of each round for accumulation
	 * Bubbles grow each round: +3, then +6, then +9, etc.
	 */
	reapplyBubbleEffects(indexes) {
		const results = [];
		
		this.activeEvents.forEach(event => {
			// Only re-apply for active bubbles (have conditional effects and status is active)
			if (event.conditionalEffects && event.status === "active") {
				// Increment rounds counter
				event.roundsActive++;
				
				// Re-apply the bubble effects
				const effectResults = event.applyEffects(indexes);
				results.push({
					event: event,
					results: effectResults
				});
			}
		});
		
		return results;
	}

	/**
	 * Process conditional effects for events based on timing
	 * For bubbles: only remove if bubble pops (triggered + discardOnConditionalTrigger)
	 * When bubble pops, apply only the static amount (not accumulated)
	 * @returns {Array} Array of roll results
	 */
	processConditionalEvents(timing, indexes) {
		const eventsToRemove = [];
		const rollResults = [];

		for (let i = 0; i < this.activeEvents.length; i++) {
			const event = this.activeEvents[i];
			
			// Check if event has conditional effects with matching timing
			if (event.conditionalEffects && event.conditionalEffects.timing === timing) {
				// Apply conditional effects (always the static amount)
				const result = event.applyConditionalEffects(indexes);
				
				rollResults.push({
					event: event,
					triggered: result.triggered,
					roll: result.roll,
					results: result.results,
					roundsActive: event.roundsActive
				});
				
				// Only remove if triggered AND should be discarded
				// For bubbles: remove only if bubble pops (triggered)
				// If not triggered, bubble stays active
				if (result.triggered && event.shouldDiscard()) {
					// Store the static pop effects for visual display next round
					if (event.conditionalEffects && event.conditionalEffects.effects) {
						this.recentPopEffects.push(...event.conditionalEffects.effects);
					}
					eventsToRemove.push(i);
				}
			}

			// Also apply non-conditional events with matching timing
			if (event.timing === timing && event.status === "pending") {
				event.applyEffects(indexes);
			}
		}

		// Remove discarded events (iterate backwards to avoid index issues)
		for (let i = eventsToRemove.length - 1; i >= 0; i--) {
			this.activeEvents.splice(eventsToRemove[i], 1);
		}

		return rollResults;
	}

	/**
	 * Clean up resolved events with "start" timing at end of round
	 * Also clears recent pop effects (they've been displayed for one round)
	 * @returns {number} Number of events removed
	 */
	cleanupResolvedStartEvents() {
		const initialCount = this.activeEvents.length;
		
		this.activeEvents = this.activeEvents.filter(event => {
			return !(event.timing === "start" && event.status === "resolved");
		});

		// Clear recent pop effects after one round cycle
		this.recentPopEffects = [];

		return initialCount - this.activeEvents.length;
	}

	/**
	 * Peek at the next event without drawing it (for Market Forecast action card)
	 * @returns {EventCard|null} The next event or null if deck is empty
	 */
	peekNextEvent() {
		if (!this.eventDeck || this.eventDeck.isEmpty()) {
			return null;
		}
		// Peek at the top card without removing it
		// In Deck class, cards are drawn from the end, so peek at last element
		const cards = this.eventDeck.cards;
		return cards.length > 0 ? cards[cards.length - 1] : null;
	}

	/**
	 * Shuffle the event deck (for Market Uncertainty action card)
	 * @returns {boolean} True if shuffled successfully
	 */
	shuffleEventDeck() {
		if (this.eventDeck) {
			this.eventDeck.shuffle();
			return true;
		}
		return false;
	}

	/**
	 * Get all active events for serialization
	 */
	getActiveEventsJSON() {
		return this.activeEvents.map(e => e.toJSON());
	}

	/**
	 * Get effects for visual display (combines active events + recent pop effects)
	 * Shows static amount per round, not accumulated total
	 */
	getVisualEffects() {
		const effects = [];
		
		// Add effects from active events (static amount only)
		this.activeEvents.forEach(event => {
			if (event.effects && Array.isArray(event.effects)) {
				effects.push(...event.effects);
			}
		});

		// Add recent pop effects (static amount only)
		effects.push(...this.recentPopEffects);

		return effects;
	}
}

module.exports = EventManager;

