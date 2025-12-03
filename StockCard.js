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
      archetype: this.archetype,
      appliedActionCards: this.appliedActionCards || [] // Include applied action cards for visual display
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

// Helper function to split camelCase/PascalCase words
function splitWords(name) {
  return name.replace(/([a-z])([A-Z])/g, '$1 $2');
}

// Helper function to calculate base cost
function calculateBaseCost(dividend, growth) {
  return Math.round((dividend * 1.5) + (growth * 2)) - 4;
}

// Add default deck data
// Distribution: 50% div=1 growth=2-4, 25% div=0 growth=4-6, 25% div=2-5 growth=2
// 16 cards total: 8 with div=1, 4 with div=0, 4 with div=2-5
const DEFAULT_DECK_DATA = [
  // TECH SECTOR (8 cards)
  {
    "name": splitWords("CloudNein"),
    "dividend": 1,
    "growth": 3,
    "description": "Infinite server farms powered by venture capital and broken promises.",
    "industrySector": "tech",
    "archetype": "High Growth"
  },
  {
    "name": splitWords("PixelPanic"),
    "dividend": 3,
    "growth": 2,
    "description": "Legacy software empire draining enterprises with mandatory subscriptions.",
    "industrySector": "tech",
    "archetype": "High Dividend"
  },
  {
    "name": splitWords("ByteBandit"),
    "dividend": 1,
    "growth": 2,
    "description": "Cybersecurity theater promising protection while selling your data.",
    "industrySector": "tech",
    "archetype": "Balanced"
  },
  {
    "name": splitWords("HyperHype AI"),
    "dividend": 0,
    "growth": 5,
    "description": "Revolutionary machine learning that's actually just spreadsheets and hype.",
    "industrySector": "tech",
    "archetype": "Premium"
  },
  {
    "name": splitWords("DataMine Corp"),
    "dividend": 1,
    "growth": 4,
    "description": "Harvesting personal information and selling it back to you as features.",
    "industrySector": "tech",
    "archetype": "High Growth"
  },
  {
    "name": splitWords("CodeCrash Systems"),
    "dividend": 2,
    "growth": 2,
    "description": "Buggy software updates that break more than they fix.",
    "industrySector": "tech",
    "archetype": "High Dividend"
  },
  {
    "name": splitWords("VaporWare Tech"),
    "dividend": 0,
    "growth": 4,
    "description": "Promising revolutionary products that never materialize.",
    "industrySector": "tech",
    "archetype": "High Growth"
  },
  {
    "name": splitWords("AppStore Monopoly"),
    "dividend": 1,
    "growth": 3,
    "description": "Taking a cut from every transaction while providing minimal value.",
    "industrySector": "tech",
    "archetype": "Balanced"
  },
  
  // FINANCE SECTOR (8 cards)
  {
    "name": splitWords("GoldHoard Bank"),
    "dividend": 4,
    "growth": 2,
    "description": "Ancient institution hoarding wealth in marble vaults.",
    "industrySector": "finance",
    "archetype": "High Dividend"
  },
  {
    "name": splitWords("CryptoChaos Fund"),
    "dividend": 0,
    "growth": 4,
    "description": "Gambling on digital tokens backed by memes and pure speculation.",
    "industrySector": "finance",
    "archetype": "High Growth"
  },
  {
    "name": splitWords("FeeHarvest Co"),
    "dividend": 1,
    "growth": 4,
    "description": "Collecting tiny transaction fees from millions, one cent at a time.",
    "industrySector": "finance",
    "archetype": "Balanced"
  },
  {
    "name": splitWords("MoneyPrinter Inc"),
    "dividend": 1,
    "growth": 3,
    "description": "Elite trading algorithms front-running markets with perfect legal immunity.",
    "industrySector": "finance",
    "archetype": "Premium"
  },
  {
    "name": splitWords("LoanShark Capital"),
    "dividend": 1,
    "growth": 2,
    "description": "Predatory lending with interest rates that compound faster than problems.",
    "industrySector": "finance",
    "archetype": "Balanced"
  },
  {
    "name": splitWords("BubbleMaker Investments"),
    "dividend": 0,
    "growth": 6,
    "description": "Inflating asset prices until they pop and leave investors holding nothing.",
    "industrySector": "finance",
    "archetype": "High Growth"
  },
  {
    "name": splitWords("TaxHaven Trust"),
    "dividend": 5,
    "growth": 2,
    "description": "Helping the wealthy hide money while ordinary people pay full price.",
    "industrySector": "finance",
    "archetype": "High Dividend"
  },
  {
    "name": splitWords("CreditCrush Corp"),
    "dividend": 1,
    "growth": 3,
    "description": "Issuing credit cards with hidden fees and sky-high interest rates.",
    "industrySector": "finance",
    "archetype": "Premium"
  },
  
  // INDUSTRIAL SECTOR (8 cards)
  {
    "name": splitWords("SteelDinosaur"),
    "dividend": 2,
    "growth": 2,
    "description": "Rusty factories churning out yesterday's products at tomorrow's prices.",
    "industrySector": "industrial",
    "archetype": "High Dividend"
  },
  {
    "name": splitWords("RoboFuture Labs"),
    "dividend": 1,
    "growth": 4,
    "description": "Prototype robots that break down more than they build up.",
    "industrySector": "industrial",
    "archetype": "High Growth"
  },
  {
    "name": splitWords("WidgetMill"),
    "dividend": 1,
    "growth": 2,
    "description": "Producing reliable widgets nobody asked for in quantities nobody needs.",
    "industrySector": "industrial",
    "archetype": "Balanced"
  },
  {
    "name": splitWords("TitanForge"),
    "dividend": 0,
    "growth": 6,
    "description": "Massive industrial complex dominating supply chains through sheer inertia.",
    "industrySector": "industrial",
    "archetype": "Premium"
  },
  {
    "name": splitWords("SmokeStack Industries"),
    "dividend": 1,
    "growth": 3,
    "description": "Polluting the environment while claiming to be carbon neutral.",
    "industrySector": "industrial",
    "archetype": "Balanced"
  },
  {
    "name": splitWords("AssemblyLine Corp"),
    "dividend": 3,
    "growth": 2,
    "description": "Monotonous production lines churning out identical products endlessly.",
    "industrySector": "industrial",
    "archetype": "High Dividend"
  },
  {
    "name": splitWords("WasteMaker Global"),
    "dividend": 0,
    "growth": 5,
    "description": "Producing disposable goods designed to break and be replaced.",
    "industrySector": "industrial",
    "archetype": "High Growth"
  },
  {
    "name": splitWords("ConcreteGiant Ltd"),
    "dividend": 1,
    "growth": 4,
    "description": "Paving over nature one parking lot at a time.",
    "industrySector": "industrial",
    "archetype": "Premium"
  },
  
  // HEALTH & SCIENCE SECTOR (8 cards)
  {
    "name": splitWords("PillMill Pharma"),
    "dividend": 5,
    "growth": 2,
    "description": "Patent monopolies on life-saving drugs marked up thousands of percent.",
    "industrySector": "Health and Science",
    "archetype": "High Dividend"
  },
  {
    "name": splitWords("GeneSplice Dreams"),
    "dividend": 0,
    "growth": 5,
    "description": "Gene therapy startup burning cash faster than curing diseases.",
    "industrySector": "Health and Science",
    "archetype": "High Growth"
  },
  {
    "name": splitWords("BandAid Biotech"),
    "dividend": 1,
    "growth": 3,
    "description": "Incremental improvements to medical devices nobody complained about.",
    "industrySector": "Health and Science",
    "archetype": "Balanced"
  },
  {
    "name": splitWords("LifeCode Systems"),
    "dividend": 1,
    "growth": 4,
    "description": "Breakthrough treatments locked behind insurance bureaucracy and gold-plated pricing.",
    "industrySector": "Health and Science",
    "archetype": "Premium"
  },
  {
    "name": splitWords("PlaceboPill Co"),
    "dividend": 2,
    "growth": 2,
    "description": "Selling expensive sugar pills with fancy packaging and marketing.",
    "industrySector": "Health and Science",
    "archetype": "High Dividend"
  },
  {
    "name": splitWords("LabRat Research"),
    "dividend": 1,
    "growth": 2,
    "description": "Endless clinical trials that lead nowhere but generate funding.",
    "industrySector": "Health and Science",
    "archetype": "Balanced"
  },
  {
    "name": splitWords("MiracleCure Inc"),
    "dividend": 0,
    "growth": 4,
    "description": "Promising revolutionary cures that never make it past the lab.",
    "industrySector": "Health and Science",
    "archetype": "High Growth"
  },
  {
    "name": splitWords("TestTube Ventures"),
    "dividend": 1,
    "growth": 3,
    "description": "Experimental treatments with more side effects than benefits.",
    "industrySector": "Health and Science",
    "archetype": "Premium"
  }
].map(card => ({
  ...card,
  baseCost: calculateBaseCost(card.dividend, card.growth)
}));

module.exports = StockCard;