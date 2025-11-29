const Card = require('./Card');

class StockCard extends Card {
  constructor({ name, baseCost = 0, dividend = 0, growth = 1, description = 'Stock', industrySector='None', archetype="None" } = {}) {
    // pass name and description to base Card
    const stockName = String(name || 'Unnamed Stock');
    const stockDescription = String(description || 'Stock');
    super(stockName, stockDescription);

    // baseCost can be positive or negative number
    this.baseCost = Number(baseCost);
    if (!Number.isFinite(this.baseCost)) {
      throw new Error('baseCost must be a finite number');
    }

    // dividend must be an integer
    this.dividend = Number(dividend);
    if (!Number.isInteger(this.dividend)) {
      throw new Error('dividend must be an integer');
    }

    // growth must be a positive integer
    this.growth = Number(growth);
    if (!Number.isInteger(this.growth) || this.growth <= 0) {
      throw new Error('growth must be a positive integer');
    }

    // Set and validate industrySector (must be a non-empty string)
    this.industrySector = String(industrySector || 'None').trim();
    if (this.industrySector.length === 0) {
      throw new Error('industrySector must be a non-empty string');
    }

    // Set and validate archetype (must be a non-empty string)
    this.archetype = String(archetype || 'None').trim();
    if (this.archetype.length === 0) {
      throw new Error('archetype must be a non-empty string');
    }
  }

  // return base cost plus optional modifier (modifier can be negative)
  currentCost(modifier = 0) {
    return this.baseCost + Number(modifier);
  }

  // apply growth as an absolute increase
  applyAbsoluteGrowth() {
    this.baseCost += this.growth;
    return this.baseCost;
  }

  // apply growth as percent (growth = 10 -> +10%)
  applyPercentGrowth(round = true) {
    const factor = 1 + this.growth / 100;
    const newCost = this.baseCost * factor;
    this.baseCost = round ? Math.round(newCost) : newCost;
    return this.baseCost;
  }

  toString() {
    return `${this.name} — base:${this.baseCost} dividend:${this.dividend} growth:${this.growth} sector:${this.industrySector} archetype:${this.archetype} — ${this.description}`;
  }

  // Get the related index for this stock
  getRelatedIndex(indexes) {
    if (!Array.isArray(indexes)) return null;
    return indexes.find(idx => idx.name === this.industrySector);
  }

  // Get the current cost based on related index price
  getCostWithIndex(indexes) {
    const relatedIndex = this.getRelatedIndex(indexes);
    if (!relatedIndex) return this.baseCost;
    
    // Calculate cost as baseCost + (index price - 10) 
    // This means index at 10 = no modifier, above 10 = more expensive, below 10 = cheaper
    const indexModifier = relatedIndex.price - 10;
    return Math.max(1, this.baseCost + indexModifier);
  }

  // Ensure proper JSON serialization
  toJSON() {
    return {
      name: this.name,
      description: this.description,
      baseCost: this.baseCost,
      dividend: this.dividend,
      growth: this.growth,
      industrySector: this.industrySector,
      archetype: this.archetype
    };
  }

  static createDeck() {
        const src = DEFAULT_DECK_DATA;
        if (!Array.isArray(src)) {
        throw new Error('createDeck expects an array of card spec objects');
        }
        return src.map((spec) => {
            if (spec == null || typeof spec !== 'object') {
                throw new Error('each card spec must be an object');
            }
            return new StockCard(spec);
        });
    }
}

// Add default deck data (the provided JSON)
const DEFAULT_DECK_DATA = [
  // TECH SECTOR
  {
    "name": "CloudNein",
    "baseCost": 7,
    "dividend": 1,
    "growth": 5,
    "description": "Infinite server farms powered by venture capital and broken promises.",
    "industrySector": "tech",
    "archetype": "High Growth"
  },
  {
    "name": "PixelPanic",
    "baseCost": 7,
    "dividend": 3,
    "growth": 2,
    "description": "Legacy software empire draining enterprises with mandatory subscriptions.",
    "industrySector": "tech",
    "archetype": "High Dividend"
  },
  {
    "name": "ByteBandit",
    "baseCost": 6,
    "dividend": 2,
    "growth": 3,
    "description": "Cybersecurity theater promising protection while selling your data.",
    "industrySector": "tech",
    "archetype": "Balanced"
  },
  {
    "name": "HyperHype AI",
    "baseCost": 9,
    "dividend": 3,
    "growth": 4,
    "description": "Revolutionary machine learning that's actually just spreadsheets and hype.",
    "industrySector": "tech",
    "archetype": "Premium"
  },
  
  // FINANCE SECTOR
  {
    "name": "GoldHoard Bank",
    "baseCost": 7,
    "dividend": 3,
    "growth": 2,
    "description": "Ancient institution hoarding wealth in marble vaults since the dawn of time.",
    "industrySector": "finance",
    "archetype": "High Dividend"
  },
  {
    "name": "CryptoChaos Fund",
    "baseCost": 5,
    "dividend": 0,
    "growth": 5,
    "description": "Gambling on digital tokens backed by memes and pure speculation.",
    "industrySector": "finance",
    "archetype": "High Growth"
  },
  {
    "name": "FeeHarvest Co",
    "baseCost": 7,
    "dividend": 2,
    "growth": 4,
    "description": "Collecting tiny transaction fees from millions, one cent at a time.",
    "industrySector": "finance",
    "archetype": "Balanced"
  },
  {
    "name": "MoneyPrinter Inc",
    "baseCost": 10,
    "dividend": 3,
    "growth": 5,
    "description": "Elite trading algorithms front-running markets with perfect legal immunity.",
    "industrySector": "finance",
    "archetype": "Premium"
  },
  
  // INDUSTRIAL SECTOR
  {
    "name": "SteelDinosaur",
    "baseCost": 7,
    "dividend": 3,
    "growth": 2,
    "description": "Rusty factories churning out yesterday's products at tomorrow's prices.",
    "industrySector": "industrial",
    "archetype": "High Dividend"
  },
  {
    "name": "RoboFuture Labs",
    "baseCost": 7,
    "dividend": 1,
    "growth": 5,
    "description": "Prototype robots that break down more than they build up.",
    "industrySector": "industrial",
    "archetype": "High Growth"
  },
  {
    "name": "WidgetMill",
    "baseCost": 6,
    "dividend": 2,
    "growth": 3,
    "description": "Producing reliable widgets nobody asked for in quantities nobody needs.",
    "industrySector": "industrial",
    "archetype": "Balanced"
  },
  {
    "name": "TitanForge",
    "baseCost": 9,
    "dividend": 3,
    "growth": 4,
    "description": "Massive industrial complex dominating supply chains through sheer inertia.",
    "industrySector": "industrial",
    "archetype": "Premium"
  },
  
  // HEALTH & SCIENCE SECTOR
  {
    "name": "PillMill Pharma",
    "baseCost": 7,
    "dividend": 3,
    "growth": 2,
    "description": "Patent monopolies on life-saving drugs marked up 10,000 percent.",
    "industrySector": "Health and Science",
    "archetype": "High Dividend"
  },
  {
    "name": "GeneSplice Dreams",
    "baseCost": 5,
    "dividend": 0,
    "growth": 5,
    "description": "Gene therapy startup burning cash faster than curing diseases.",
    "industrySector": "Health and Science",
    "archetype": "High Growth"
  },
  {
    "name": "BandAid Biotech",
    "baseCost": 6,
    "dividend": 2,
    "growth": 3,
    "description": "Incremental improvements to medical devices nobody complained about.",
    "industrySector": "Health and Science",
    "archetype": "Balanced"
  },
  {
    "name": "LifeCode Systems",
    "baseCost": 10,
    "dividend": 3,
    "growth": 5,
    "description": "Breakthrough treatments locked behind insurance bureaucracy and gold-plated pricing.",
    "industrySector": "Health and Science",
    "archetype": "Premium"
  }
];

module.exports = StockCard;