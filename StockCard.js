const Card = require('./Card');

class StockCard extends Card {
  constructor({ name, baseCost = 0, dividend = 0, growth = 1, description = 'Stock', industrySector='None', archetype="None" } = {}) {
    // pass a representative value to base Card (use name)
    super(name);

    // ...existing code...
    this.name = String(name || 'Unnamed Stock');

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

    this.description = String(description);

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
    return `${this.name} — base:${this.baseCost} dividend:${this.dividend} growth:${this.growth} sector:${this.industrySector} archetype:${this.archetype}`;
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
  {
    "name": "TechTitan",
    "baseCost": 8,
    "dividend": 1,
    "growth": 5,
    "description": "Parody of mega cloud computing giants, dominating data storage with endless server farms.",
    "industrySector": "tech",
    "archetype": "High Growth Tech"
  },
  {
    "name": "GadgetGuru",
    "baseCost": 6,
    "dividend": 2,
    "growth": 5,
    "description": "Spoof on smartphone innovators, churning out shiny devices that break after one drop.",
    "industrySector": "tech",
    "archetype": "Growth Gadget Maker"
  },
  {
    "name": "ByteBusters",
    "baseCost": 4,
    "dividend": 3,
    "growth": 4,
    "description": "Satire of antivirus firms, promising unbreakable firewalls that leak like sieves.",
    "industrySector": "tech",
    "archetype": "Balanced Software"
  },
  {
    "name": "SockStream",
    "baseCost": 2,
    "dividend": 4,
    "growth": 2,
    "description": "Mockery of video streamers, buffering eternally while hoarding your subscription cash.",
    "industrySector": "tech",
    "archetype": "High Dividend Media"
  },
  {
    "name": "MoneyMogul Bank",
    "baseCost": 8,
    "dividend": 4,
    "growth": 2,
    "description": "Parody of old-school investment banks, paying fat yields from dusty vaults.",
    "industrySector": "finance",
    "archetype": "High Dividend Lender"
  },
  {
    "name": "WallSt Wizards",
    "baseCost": 6,
    "dividend": 3,
    "growth": 3,
    "description": "Take on trading platforms, shuffling fees while pretending to democratize wealth.",
    "industrySector": "finance",
    "archetype": "Balanced Broker"
  },
  {
    "name": "FinFiasco Insure",
    "baseCost": 4,
    "dividend": 2,
    "growth": 4,
    "description": "Spoof of fintech disruptors, growing fast on risky loans to impulse buyers.",
    "industrySector": "finance",
    "archetype": "Growth Fintech"
  },
  {
    "name": "CashCouch Fund",
    "baseCost": 2,
    "dividend": 1,
    "growth": 5,
    "description": "Satire of high-risk hedge funds, volatile bets on meme coins and hype.",
    "industrySector": "finance",
    "archetype": "High Growth Speculator"
  },
  {
    "name": "SteelStamp Corp",
    "baseCost": 8,
    "dividend": 4,
    "growth": 2,
    "description": "Parody of legacy auto makers, cranking dividends from rusty assembly lines.",
    "industrySector": "manufacturing",
    "archetype": "High Dividend Industrial"
  },
  {
    "name": "WidgetWorks Ltd",
    "baseCost": 6,
    "dividend": 3,
    "growth": 3,
    "description": "Mock heavy machinery giants, steady output of gears and widgets forever.",
    "industrySector": "manufacturing",
    "archetype": "Balanced Manufacturer"
  },
  {
    "name": "RoboForge Inc",
    "baseCost": 4,
    "dividend": 2,
    "growth": 4,
    "description": "Spoof on automation firms, expanding factories with glitchy AI robots.",
    "industrySector": "manufacturing",
    "archetype": "Growth Automator"
  },
  {
    "name": "NutNut Bolts",
    "baseCost": 2,
    "dividend": 1,
    "growth": 5,
    "description": "Take on speculative drone makers, soaring high on vaporware promises.",
    "industrySector": "manufacturing",
    "archetype": "High Growth Innovator"
  },
  {
    "name": "PillPush Pharma",
    "baseCost": 8,
    "dividend": 4,
    "growth": 2,
    "description": "Parody of big drug makers, milking patents for reliable pill profits.",
    "industrySector": "health and science",
    "archetype": "High Dividend Pharma"
  },
  {
    "name": "GeneGamble Bio",
    "baseCost": 6,
    "dividend": 2,
    "growth": 5,
    "description": "Satire of biotech dreamers, betting on miracle cures that mostly flop.",
    "industrySector": "health and science",
    "archetype": "High Growth Biotech"
  },
  {
    "name": "HealHack Labs",
    "baseCost": 4,
    "dividend": 3,
    "growth": 4,
    "description": "Spoof on medtech wearables, tracking your steps to nowhere useful.",
    "industrySector": "health and science",
    "archetype": "Balanced Medtech"
  },
  {
    "name": "SerumStable Co",
    "baseCost": 2,
    "dividend": 1,
    "growth": 3,
    "description": "Mock vaccine rushers, steady science with occasional booster hype.",
    "industrySector": "health and science",
    "archetype": "Steady Science"
  }
];

module.exports = StockCard;