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
				description: "Tech stocks surge as investors discover 'this time is different.' Spoiler: it isn't.",
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
				description: "Everyone's cousin is now a blockchain expert. Your uncle bought $500 of meme coins.",
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
				description: "One company claims their pill cures baldness AND makes you rich. Investors buy both claims.",
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
				description: "A toolshed in a major city just sold for millions. Totally normal and sustainable!",
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
				description: "Economists remember infinite growth on a finite planet is problematic. Markets hate math.",
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
				description: "Robots get smarter. Your job gets nervous. Shareholders throw a party.",
				timing: "start",
				effects: [
					{ indexName: "tech", priceChange: 3 }
				]
			},
			{
				name: "Regional Banking Crisis",
				description: "Turns out investing in 'definitely not risky' bonds can be risky. Who knew?",
				timing: "start",
				effects: [
					{ indexName: "finance", priceChange: -3 }
				]
			},
			{
				name: "Automation Surge",
				description: "Factories replace workers with robots who don't need coffee breaks or fair wages.",
				timing: "start",
				effects: [
					{ indexName: "industrial", priceChange: 2 }
				]
			},
			{
				name: "Healthcare Reform",
				description: "Politicians promise to fix healthcare. Lobbyists promise they won't.",
				timing: "start",
				effects: [
					{ indexName: "Health and Science", priceChange: 2 }
				]
			},
			{
				name: "Market Correction",
				description: "Stocks fall. Financial advisors explain this was 'totally expected' even though they said the opposite yesterday.",
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
				description: "Central bank activates money printer. Economy goes brrrrr.",
				timing: "start",
				effects: [
					{ indexName: "tech", priceChange: 2 },
					{ indexName: "finance", priceChange: 2 },
					{ indexName: "industrial", priceChange: 2 },
					{ indexName: "Health and Science", priceChange: 2 }
				]
			},
		{
			name: "Invisible Hand",
			description: "Sometimes nobody knows that is going to happen next, but it happens anyway.",
			timing: "start",
			effects: [
				{ indexName: "tech", priceChange: Math.round(Math.random() * 4 - 2) },
				{ indexName: "finance", priceChange: Math.round(Math.random() * 4 - 2) },
				{ indexName: "industrial", priceChange: Math.round(Math.random() * 4 - 2) },
				{ indexName: "Health and Science", priceChange: Math.round(Math.random() * 4 - 2) }
			]
		},
			{
				name: "Fintech Expansion",
				description: "A new app promises to disrupt banking. It's payment apps with extra steps and VC funding.",
				timing: "start",
				effects: [
					{ indexName: "tech", priceChange: 2 },
					{ indexName: "finance", priceChange: 2 }
				]
			},
			{
				name: "Supply Chain Disruption",
				description: "That boat stuck in the canal? Yeah, your electronics are on it. So is everyone else's.",
				timing: "start",
				effects: [
					{ indexName: "industrial", priceChange: -3 }
				]
			},
			{
				name: "mRNA Breakthrough",
				description: "Science does something amazing. Half of social media becomes vaccine experts overnight.",
				timing: "start",
				effects: [
					{ indexName: "Health and Science", priceChange: 3 }
				]
			},
			{
				name: "Machine Learning Advance",
				description: "AI writes code, makes art, and takes jobs. Still can't fold fitted sheets.",
				timing: "start",
				effects: [
					{ indexName: "tech", priceChange: 2 }
				]
			},
			{
				name: "Bank Earnings Beat",
				description: "Banks make record profits by charging you $35 for being $0.12 overdrawn. Resilient business model!",
				timing: "start",
				effects: [
					{ indexName: "finance", priceChange: 2 }
				]
			},
			{
				name: "Green Energy Initiative",
				description: "Government finally decides to address climate change. Oil lobbyists file into conference room.",
				timing: "start",
				effects: [
					{ indexName: "industrial", priceChange: 2 }
				]
			},
			{
				name: "Data Breach",
				description: "Your data was stolen. Again. Time to change that password from 'Password123' to 'Password124.'",
				timing: "start",
				effects: [
					{ indexName: "tech", priceChange: -4 }
				]
			},
			{
				name: "Accounting Scandal",
				description: "Executives creatively interpreted 'profit' as 'whatever we want it to be.'",
				timing: "start",
				effects: [
					{ indexName: "finance", priceChange: -3 }
				]
			},
			{
				name: "Clinical Trial Failure",
				description: "Drug that was supposed to cure everything actually cures nothing. Investors shocked that biology is hard.",
				timing: "start",
				effects: [
					{ indexName: "Health and Science", priceChange: -3 }
				]
			},
			{
				name: "Yield Curve Inverts",
				description: "The yield curve inverted. This means... something. Economists argue about what, exactly.",
				timing: "start",
				effects: [
					{ indexName: "finance", priceChange: -3 },
					{ indexName: "industrial", priceChange: -2 }
				]
			},
			{
				name: "Tech Sector Layoffs",
				description: "Tech company fires 10,000 workers to 'increase efficiency.' CEO gets $50M bonus for tough decision.",
				timing: "start",
				effects: [
					{ indexName: "tech", priceChange: -2 }
				]
			},
			{
				name: "Pandemic Preparedness",
				description: "Government invests in pandemic prep after the pandemic. Better late than never...?",
				timing: "start",
				effects: [
					{ indexName: "Health and Science", priceChange: 2 }
				]
			},
			{
				name: "Antitrust Action",
				description: "Regulators finally notice that monopolies might be monopolistic. Tech CEOs schedule sad face practice.",
				timing: "start",
				effects: [
					{ indexName: "tech", priceChange: -3 }
				]
			},
			{
				name: "Infrastructure Package",
				description: "Government agrees to fix aging infrastructure. Only took decades of debate!",
				timing: "start",
				effects: [
					{ indexName: "industrial", priceChange: 3 }
				]
			},
			{
				name: "Credit Downgrade",
				description: "Rating agency downgrades country's credit. Same agency that rated junk bonds AAA before.",
				timing: "start",
				effects: [
					{ indexName: "finance", priceChange: -2 }
				]
			},
			{
				name: "Trade Agreement",
				description: "Countries agree to trade more freely. Economists claim everyone wins. Factory workers have questions.",
				timing: "start",
				effects: [
					{ indexName: "industrial", priceChange: 2 },
					{ indexName: "tech", priceChange: 1 }
				]
			},
			{
				name: "Patent Expiration",
				description: "Big Pharma's $1000/pill loses patent protection. Generic version costs $3. What a mystery!",
				timing: "start",
				effects: [
					{ indexName: "Health and Science", priceChange: -2 }
				]
			},
			{
				name: "Venture Capital Surge",
				description: "VCs invest billions in startups with no revenue but amazing slides. History repeats itself!",
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