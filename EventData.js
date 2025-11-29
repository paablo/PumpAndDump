/**
 * EventData - Contains all event definitions for the game
 * Separated from EventCard class for better data management
 */

class EventData {
	/**
	 * Get all bubble events (events with conditional end-round effects)
	 * Bubbles apply +X at start, then at end of round:
	 *   - If bubble pops: apply -X to cancel the gain, discard event
	 *   - If bubble holds: keep event active (maintains visual indicator)
	 */
	static getBubbleEvents() {
		return [
			{
				name: "Tech Bubble",
				description: "Tech sector soars on speculation, but bubble may burst!",
				timing: "start",
				effects: [
					{ indexName: "tech", priceChange: 3 }
				],
				conditionalEffects: {
					timing: "end",
					dieRoll: { min: 1, max: 6, success: [1, 2, 3] }, // 50% chance to pop
					effects: [
						{ indexName: "tech", priceChange: -3 } // Cancels initial +3
					]
				},
				discardOnConditionalTrigger: true // Only discard if pops
			},
			{
				name: "Crypto Bubble",
				description: "Digital currency frenzy drives finance sector. Volatility ahead!",
				timing: "start",
				effects: [
					{ indexName: "finance", priceChange: 3 }
				],
				conditionalEffects: {
					timing: "end",
					dieRoll: { min: 1, max: 6, success: [1, 2] }, // 33% chance to pop
					effects: [
						{ indexName: "finance", priceChange: -3 } // Cancels initial +3
					]
				},
				discardOnConditionalTrigger: true // Only discard if pops
			},
			{
				name: "Biotech Bubble",
				description: "Medical breakthrough boosts health sector, but risks remain",
				timing: "start",
				effects: [
					{ indexName: "Health and Science", priceChange: 3 }
				],
				conditionalEffects: {
					timing: "end",
					dieRoll: { min: 1, max: 6, success: [1, 2] }, // 33% chance to pop
					effects: [
						{ indexName: "Health and Science", priceChange: -3 } // Cancels initial +3
					]
				},
				discardOnConditionalTrigger: true // Only discard if pops
			},
			{
				name: "Industrial Bubble",
				description: "Manufacturing hype drives industrial sector to unsustainable heights",
				timing: "start",
				effects: [
					{ indexName: "industrial", priceChange: 3 }
				],
				conditionalEffects: {
					timing: "end",
					dieRoll: { min: 1, max: 6, success: [1] }, // 17% chance to pop
					effects: [
						{ indexName: "industrial", priceChange: -3 } // Cancels initial +3
					]
				},
				discardOnConditionalTrigger: true // Only discard if pops
			}
		];
	}

	/**
	 * Get all regular events (simple start-timing events)
	 */
	static getRegularEvents() {
		return [
			{
				name: "Tech Boom",
				description: "Innovation drives technology sector to new heights",
				timing: "start",
				effects: [
					{ indexName: "tech", priceChange: 3 }
				]
			},
			{
				name: "Financial Crisis",
				description: "Market panic spreads across financial institutions",
				timing: "start",
				effects: [
					{ indexName: "finance", priceChange: -3 }
				]
			},
			{
				name: "Industrial Revolution 2.0",
				description: "Manufacturing sector experiences breakthrough efficiency gains",
				timing: "start",
				effects: [
					{ indexName: "industrial", priceChange: 2 }
				]
			},
			{
				name: "Healthcare Reform",
				description: "New regulations reshape the healthcare landscape",
				timing: "start",
				effects: [
					{ indexName: "Health and Science", priceChange: 2 }
				]
			},
			{
				name: "Market Correction",
				description: "Broad market selloff affects all sectors",
				timing: "start",
				effects: [
					{ indexName: "tech", priceChange: -2 },
					{ indexName: "finance", priceChange: -2 },
					{ indexName: "industrial", priceChange: -2 },
					{ indexName: "Health and Science", priceChange: -2 }
				]
			},
			{
				name: "Bull Market",
				description: "Optimism drives gains across all sectors",
				timing: "start",
				effects: [
					{ indexName: "tech", priceChange: 2 },
					{ indexName: "finance", priceChange: 2 },
					{ indexName: "industrial", priceChange: 2 },
					{ indexName: "Health and Science", priceChange: 2 }
				]
			},
			{
				name: "Tech-Finance Alliance",
				description: "Fintech revolution benefits both tech and finance sectors",
				timing: "start",
				effects: [
					{ indexName: "tech", priceChange: 2 },
					{ indexName: "finance", priceChange: 2 }
				]
			},
			{
				name: "Supply Chain Disruption",
				description: "Global logistics problems hit industrial production hard",
				timing: "start",
				effects: [
					{ indexName: "industrial", priceChange: -3 }
				]
			},
			{
				name: "Pharmaceutical Breakthrough",
				description: "Major medical advance sends health sector soaring",
				timing: "start",
				effects: [
					{ indexName: "Health and Science", priceChange: 3 }
				]
			},
			{
				name: "AI Revolution",
				description: "Artificial intelligence breakthroughs transform tech landscape",
				timing: "start",
				effects: [
					{ indexName: "tech", priceChange: 2 }
				]
			},
			{
				name: "Banking Stability",
				description: "Strong earnings reports boost financial sector confidence",
				timing: "start",
				effects: [
					{ indexName: "finance", priceChange: 2 }
				]
			},
			{
				name: "Green Energy Push",
				description: "Environmental mandates drive industrial transformation",
				timing: "start",
				effects: [
					{ indexName: "industrial", priceChange: 2 }
				]
			}
		];
	}

	/**
	 * Get all events (bubbles + regular events)
	 * By default returns only bubble events (regular events commented out in original)
	 */
	static getAllEvents() {
		// Currently only bubble events are active
		var events = this.getBubbleEvents();
		events.push(...this.getRegularEvents());
		return events;
	}
}

module.exports = EventData;

