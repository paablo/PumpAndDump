/**
 * EventData - Contains all event definitions for the game
 * Based on real market events with subtle nods to economic theory
 */

class EventData {
	/**
	 * Get all bubble events (events with conditional end-round effects)
	 */
	static getBubbleEvents() {
		return [
			{
				name: "Tech Sector Euphoria",
				description: "Tech stocks surge. Investors exhibit notably spirited behavior.",
				timing: "start",
				effects: [
					{ indexName: "tech", priceChange: 3 }
				],
				conditionalEffects: {
					timing: "end",
					dieRoll: { min: 1, max: 6, success: [1, 2] },
					effects: [
						{ indexName: "tech", priceChange: -5 }
					]
				},
				discardOnConditionalTrigger: true
			},
			{
				name: "Crypto Mania",
				description: "Digital currency fever grips markets. Price discovery remains ongoing.",
				timing: "start",
				effects: [
					{ indexName: "finance", priceChange: 3 }
				],
				conditionalEffects: {
					timing: "end",
					dieRoll: { min: 1, max: 6, success: [1, 2] },
					effects: [
						{ indexName: "finance", priceChange: -5 }
					]
				},
				discardOnConditionalTrigger: true
			},
			{
				name: "Biotech Boom",
				description: "Clinical trials show promise. Market enthusiasm becomes somewhat elastic.",
				timing: "start",
				effects: [
					{ indexName: "Health and Science", priceChange: 3 }
				],
				conditionalEffects: {
					timing: "end",
					dieRoll: { min: 1, max: 6, success: [1, 2] },
					effects: [
						{ indexName: "Health and Science", priceChange: -5 }
					]
				},
				discardOnConditionalTrigger: true
			},
			{
				name: "Real Estate Frenzy",
				description: "Property values soar. Markets coordinate on optimistic equilibrium.",
				timing: "start",
				effects: [
					{ indexName: "industrial", priceChange: 3 }
				],
				conditionalEffects: {
					timing: "end",
					dieRoll: { min: 1, max: 6, success: [1] },
					effects: [
						{ indexName: "industrial", priceChange: -5 }
					]
				},
				discardOnConditionalTrigger: true
			},
			{
				name: "Red Scare",
				description: "Economists discover growth and resources are not infinite. Anti-capitalist ideology emerges and investors slowly withdraw from the market.",
				timing: "start",
				effects: [
						{ indexName: "tech", priceChange: -2 },
						{ indexName: "finance", priceChange: -2 },
						{ indexName: "industrial", priceChange: -2 },
						{ indexName: "Health and Science", priceChange: -2 }
				],
				conditionalEffects: {
					timing: "end",
					dieRoll: { min: 1, max: 6, success: [1] },
					effects: [
						{ indexName: "tech", priceChange: 5 },
						{ indexName: "finance", priceChange: 5 },
						{ indexName: "industrial", priceChange: 5 },
						{ indexName: "Health and Science", priceChange: 5 }
					]
				},
				discardOnConditionalTrigger: true
			}
		];
	}

	/**
	 * Get all regular events
	 */
	static getRegularEvents() {
		return [
			{
				name: "AI Breakthrough",
				description: "Major advancement in machine learning. Labor substitution accelerates.",
				timing: "start",
				effects: [
					{ indexName: "tech", priceChange: 3 }
				]
			},
			{
				name: "Regional Banking Crisis",
				description: "Bank failures spread. Risk was apparently not fully priced in.",
				timing: "start",
				effects: [
					{ indexName: "finance", priceChange: -3 }
				]
			},
			{
				name: "Automation Surge",
				description: "Manufacturing robotics adoption accelerates. Factor substitution intensifies.",
				timing: "start",
				effects: [
					{ indexName: "industrial", priceChange: 2 }
				]
			},
			{
				name: "Healthcare Reform",
				description: "New healthcare legislation passes. Incidence remains to be determined.",
				timing: "start",
				effects: [
					{ indexName: "Health and Science", priceChange: 2 }
				]
			},
			{
				name: "Market Correction",
				description: "Broad selloff across sectors. Returns revert to something or other.",
				timing: "start",
				effects: [
					{ indexName: "tech", priceChange: -2 },
					{ indexName: "finance", priceChange: -2 },
					{ indexName: "industrial", priceChange: -2 },
					{ indexName: "Health and Science", priceChange: -2 }
				]
			},
			{
				name: "Monetary Stimulus",
				description: "Central bank cuts rates aggressively. Liquidity preference addressed.",
				timing: "start",
				effects: [
					{ indexName: "tech", priceChange: 2 },
					{ indexName: "finance", priceChange: 2 },
					{ indexName: "industrial", priceChange: 2 },
					{ indexName: "Health and Science", priceChange: 2 }
				]
			},
			{
				name: "Fintech Expansion",
				description: "Digital payment platforms gain traction. Transaction costs declining.",
				timing: "start",
				effects: [
					{ indexName: "tech", priceChange: 2 },
					{ indexName: "finance", priceChange: 2 }
				]
			},
			{
				name: "Supply Chain Disruption",
				description: "Global logistics breakdown. Inventory strategies reconsidered.",
				timing: "start",
				effects: [
					{ indexName: "industrial", priceChange: -3 }
				]
			},
			{
				name: "mRNA Breakthrough",
				description: "Revolutionary vaccine platform validated. Spillover effects substantial.",
				timing: "start",
				effects: [
					{ indexName: "Health and Science", priceChange: 3 }
				]
			},
			{
				name: "Machine Learning Advance",
				description: "Neural networks reach new milestone. Returns to scale look interesting.",
				timing: "start",
				effects: [
					{ indexName: "tech", priceChange: 2 }
				]
			},
			{
				name: "Bank Earnings Beat",
				description: "Major banks report strong results. Apparently still systemic though.",
				timing: "start",
				effects: [
					{ indexName: "finance", priceChange: 2 }
				]
			},
			{
				name: "Green Energy Initiative",
				description: "Clean energy subsidies announced. Internalizing costs, more or less.",
				timing: "start",
				effects: [
					{ indexName: "industrial", priceChange: 2 }
				]
			},
			{
				name: "Data Breach",
				description: "Massive security failure. Information asymmetry achieved accidentally.",
				timing: "start",
				effects: [
					{ indexName: "tech", priceChange: -4 }
				]
			},
			{
				name: "Accounting Scandal",
				description: "Creative bookkeeping uncovered. Principal-agent problem illustrated.",
				timing: "start",
				effects: [
					{ indexName: "finance", priceChange: -3 }
				]
			},
			{
				name: "Clinical Trial Failure",
				description: "Late-stage drug trial disappoints. Prior investments non-recoverable.",
				timing: "start",
				effects: [
					{ indexName: "Health and Science", priceChange: -3 }
				]
			},
			{
				name: "Yield Curve Inverts",
				description: "Long-term rates fall below short-term. Forward guidance noted.",
				timing: "start",
				effects: [
					{ indexName: "finance", priceChange: -3 },
					{ indexName: "industrial", priceChange: -2 }
				]
			},
			{
				name: "Tech Sector Layoffs",
				description: "Major workforce reductions announced. Productivity per worker rises.",
				timing: "start",
				effects: [
					{ indexName: "tech", priceChange: -2 }
				]
			},
			{
				name: "Pandemic Preparedness",
				description: "Governments invest in medical infrastructure. Optimal provision debated.",
				timing: "start",
				effects: [
					{ indexName: "Health and Science", priceChange: 2 }
				]
			},
			{
				name: "Antitrust Action",
				description: "Tech giants face regulatory scrutiny. Market power questioned.",
				timing: "start",
				effects: [
					{ indexName: "tech", priceChange: -3 }
				]
			},
			{
				name: "Infrastructure Package",
				description: "Major public works spending approved. Multiplier effects anticipated.",
				timing: "start",
				effects: [
					{ indexName: "industrial", priceChange: 3 }
				]
			},
			{
				name: "Credit Downgrade",
				description: "Sovereign rating cut. Deficit financing becomes more expensive.",
				timing: "start",
				effects: [
					{ indexName: "finance", priceChange: -2 }
				]
			},
			{
				name: "Trade Agreement",
				description: "Tariffs reduced between major economies. Gains realized, theoretically.",
				timing: "start",
				effects: [
					{ indexName: "industrial", priceChange: 2 },
					{ indexName: "tech", priceChange: 1 }
				]
			},
			{
				name: "Patent Expiration",
				description: "Major pharmaceutical patents expire. Rents dissipate as expected.",
				timing: "start",
				effects: [
					{ indexName: "Health and Science", priceChange: -2 }
				]
			},
			{
				name: "Venture Capital Surge",
				description: "Record VC investment in startups. Valuation methodology evolving.",
				timing: "start",
				effects: [
					{ indexName: "tech", priceChange: 2 },
					{ indexName: "finance", priceChange: 1 }
				]
			}
		];
	}

	/**
	 * Get all events (bubbles + regular events)
	 */
	static getAllEvents() {
		var events = this.getBubbleEvents();
		events.push(...this.getRegularEvents());
		return events;
	}
}

module.exports = EventData;