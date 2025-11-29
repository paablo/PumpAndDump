const Card = require('./Card');
const EventData = require('./EventData');

class EventCard extends Card {
  constructor({ 
    name, 
    description = "Market Event", 
    timing = "end", 
    effects = [],
    conditionalEffects = null,
    discardOnConditionalTrigger = false
  } = {}) {
    // pass name and description to base Card
    const eventName = String(name || 'Unnamed Event');
    const eventDescription = String(description);
    super(eventName, eventDescription);

    // timing: when the initial event triggers ("start" or "end" of next round)
    this.timing = String(timing).toLowerCase();
    if (this.timing !== "start" && this.timing !== "end") {
      throw new Error('timing must be either "start" or "end"');
    }

    // effects: array of price changes to indexes
    // each effect is { indexName: string, priceChange: integer }
    if (!Array.isArray(effects)) {
      throw new Error('effects must be an array');
    }
    
    this.effects = this._validateEffects(effects);

    // conditionalEffects: optional follow-up effects that may trigger based on probability
    // structure: { timing: "start"|"end", probability: 0-1, dieRoll: {min, max, success}, effects: [] }
    this.conditionalEffects = null;
    if (conditionalEffects !== null && conditionalEffects !== undefined) {
      this.conditionalEffects = this._validateConditionalEffects(conditionalEffects);
    }

    // discardOnConditionalTrigger: if true, event is discarded after conditional effects trigger
    this.discardOnConditionalTrigger = Boolean(discardOnConditionalTrigger);

    // status: tracks event lifecycle
    // "pending" -> not yet played
    // "active" -> initial effects applied, waiting for conditional effects
    // "resolved" -> all effects completed, can be discarded
    this.status = "pending";

    // roundsActive: tracks how many rounds this bubble has been accumulating
    // Used for bubbles that grow each round
    this.roundsActive = 0;
  }

  _validateEffects(effects) {
    return effects.map(effect => {
      if (!effect || typeof effect !== 'object') {
        throw new Error('each effect must be an object');
      }
      
      const indexName = String(effect.indexName || '');
      if (!indexName) {
        throw new Error('each effect must have an indexName');
      }
      
      const priceChange = Number(effect.priceChange);
      if (!Number.isInteger(priceChange)) {
        throw new Error('priceChange must be an integer');
      }
      
      return {
        indexName,
        priceChange
      };
    });
  }

  _validateConditionalEffects(conditionalEffects) {
    if (!conditionalEffects || typeof conditionalEffects !== 'object') {
      throw new Error('conditionalEffects must be an object');
    }

    const timing = String(conditionalEffects.timing || 'end').toLowerCase();
    if (timing !== "start" && timing !== "end") {
      throw new Error('conditionalEffects timing must be either "start" or "end"');
    }

    if (!Array.isArray(conditionalEffects.effects)) {
      throw new Error('conditionalEffects.effects must be an array');
    }

    const effects = this._validateEffects(conditionalEffects.effects);

    // Validate probability OR dieRoll
    let probability = null;
    let dieRoll = null;

    if (conditionalEffects.probability !== undefined) {
      probability = Number(conditionalEffects.probability);
      if (!Number.isFinite(probability) || probability < 0 || probability > 1) {
        throw new Error('probability must be a number between 0 and 1');
      }
    }

    if (conditionalEffects.dieRoll !== undefined) {
      const dr = conditionalEffects.dieRoll;
      if (!dr || typeof dr !== 'object') {
        throw new Error('dieRoll must be an object');
      }

      const min = Number(dr.min);
      const max = Number(dr.max);
      const success = Array.isArray(dr.success) ? dr.success : [dr.success];

      if (!Number.isInteger(min) || !Number.isInteger(max) || min >= max) {
        throw new Error('dieRoll must have valid integer min and max where min < max');
      }

      if (!success.every(s => Number.isInteger(s) && s >= min && s <= max)) {
        throw new Error('dieRoll success values must be integers within min-max range');
      }

      dieRoll = { min, max, success };
    }

    return {
      timing,
      probability,
      dieRoll,
      effects
    };
  }

  // Apply the initial effects to a list of indexes
  applyEffects(indexes) {
    if (!Array.isArray(indexes)) {
      throw new Error('indexes must be an array');
    }

    const results = this._applyEffectsList(this.effects, indexes);
    
    // Update status
    if (this.status === "pending") {
      this.status = this.conditionalEffects ? "active" : "resolved";
    }

    return results;
  }

  // Check and apply conditional effects if they trigger
  // Returns { triggered: boolean, results: [], roll: number|null }
  applyConditionalEffects(indexes) {
    if (!this.conditionalEffects) {
      return { triggered: false, results: [], roll: null };
    }

    if (this.status !== "active") {
      return { triggered: false, results: [], roll: null };
    }

    // Determine if conditional effects trigger
    let triggered = false;
    let roll = null;

    if (this.conditionalEffects.probability !== null) {
      // Use probability
      const random = Math.random();
      triggered = random < this.conditionalEffects.probability;
      roll = random;
    } else if (this.conditionalEffects.dieRoll !== null) {
      // Use die roll
      const dr = this.conditionalEffects.dieRoll;
      roll = Math.floor(Math.random() * (dr.max - dr.min + 1)) + dr.min;
      triggered = dr.success.includes(roll);
    }

    if (!triggered) {
      return { triggered: false, results: [], roll };
    }

    // Apply the conditional effects
    const results = this._applyEffectsList(this.conditionalEffects.effects, indexes);

    // Update status to resolved
    this.status = "resolved";

    return { triggered: true, results, roll };
  }

  _applyEffectsList(effectsList, indexes) {
    const results = [];
    
    for (const effect of effectsList) {
      const index = indexes.find(idx => idx.name === effect.indexName);
      
      if (index && typeof index.updatePrice === 'function') {
        const oldPrice = index.price;
        const newPrice = index.updatePrice(effect.priceChange);
        
        results.push({
          indexName: effect.indexName,
          priceChange: effect.priceChange,
          oldPrice,
          newPrice
        });
      } else {
        results.push({
          indexName: effect.indexName,
          priceChange: effect.priceChange,
          error: 'Index not found or updatePrice method missing'
        });
      }
    }
    
    return results;
  }

  // Check if this event should be discarded
  shouldDiscard() {
    if (this.status === "resolved" && this.discardOnConditionalTrigger) {
      return true;
    }
    return false;
  }

  // Get a summary of what this event will do
  getEffectsSummary() {
    if (this.effects.length === 0) {
      return 'No effects';
    }
    
    let summary = this.effects.map(effect => {
      const sign = effect.priceChange >= 0 ? '+' : '';
      return `${effect.indexName} ${sign}${effect.priceChange}`;
    }).join(', ');

    if (this.conditionalEffects) {
      const condSummary = this.conditionalEffects.effects.map(effect => {
        const sign = effect.priceChange >= 0 ? '+' : '';
        return `${effect.indexName} ${sign}${effect.priceChange}`;
      }).join(', ');

      let probStr = '';
      if (this.conditionalEffects.probability !== null) {
        probStr = `${Math.round(this.conditionalEffects.probability * 100)}%`;
      } else if (this.conditionalEffects.dieRoll) {
        const dr = this.conditionalEffects.dieRoll;
        probStr = `roll ${dr.success.join('/')} on d${dr.max - dr.min + 1}`;
      }

      summary += ` | THEN ${condSummary} (${probStr})`;
    }

    return summary;
  }

  toString() {
    const timingStr = this.timing === 'start' ? 'START' : 'END';
    const statusStr = this.status !== 'pending' ? ` [${this.status.toUpperCase()}]` : '';
    return `${this.name} [${timingStr}]${statusStr} — ${this.getEffectsSummary()} — ${this.description}`;
  }

  // Ensure proper JSON serialization
  toJSON() {
    return {
      name: this.name,
      description: this.description,
      timing: this.timing,
      effects: this.effects,
      conditionalEffects: this.conditionalEffects,
      discardOnConditionalTrigger: this.discardOnConditionalTrigger,
      status: this.status,
      roundsActive: this.roundsActive
    };
  }

  // Factory method to create a deck of event cards
  static createDeck() {
    const src = EventData.getAllEvents();
    if (!Array.isArray(src)) {
      throw new Error('createDeck expects an array of event spec objects');
    }
    return src.map((spec) => {
      if (spec == null || typeof spec !== 'object') {
        throw new Error('each event spec must be an object');
      }
      return new EventCard(spec);
    });
  }
}

module.exports = EventCard;

