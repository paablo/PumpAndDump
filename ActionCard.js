const Card = require('./Card');

/**
 * ActionCard - Represents an action card that players can use during their turn
 * 
 * The execute pattern allows easy extension for new action types:
 * 1. Add new actionType to ACTION_TYPES
 * 2. Add execute method (e.g., executeNewAction)
 * 3. Add case to execute() switch
 * 4. Define action data in ActionData.js
 */

// Define valid action types for easy extension
const ACTION_TYPES = {
  FORECAST: 'forecast',
  SHUFFLE: 'shuffle',
  INSIDER_TRADING: 'insider_trading',
  MANIPULATE: 'manipulate'
  // Add new action types here
};

class ActionCard extends Card {
  constructor({ 
    name, 
    description = "Action Card", 
    actionType,
    targetType = "none", // "none", "stock", "event", "index", "player"
    effectValue = 0 // For discount, price change, etc.
  } = {}) {
    const actionName = String(name || 'Unnamed Action');
    const actionDescription = String(description);
    super(actionName, actionDescription);

    // Validate actionType
    this.actionType = String(actionType);
    this.targetType = String(targetType);
    this.effectValue = Number(effectValue);
    
    // Unique ID for tracking which card is which
    this.id = `${actionType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Check if this action needs a target
  needsTarget() {
    return this.targetType !== "none";
  }

  /**
   * Execute the action - dispatcher pattern for extensibility
   * To add new action types:
   * 1. Add case to switch statement
   * 2. Implement execute[ActionType] method
   */
  execute(context) {
    switch(this.actionType) {
      case ACTION_TYPES.FORECAST:
        return this.executeForecast(context);
      case ACTION_TYPES.SHUFFLE:
        return this.executeShuffle(context);
      case ACTION_TYPES.INSIDER_TRADING:
        return this.executeInsiderTrading(context);
      case ACTION_TYPES.MANIPULATE:
        return this.executeManipulate(context);
      // Add new action type cases here
      default:
        return { success: false, message: `Unknown action type: ${this.actionType}` };
    }
  }

  /**
   * Market Forecast - Peek at next event card
   */
  executeForecast(context) {
    const { eventManager } = context;
    const nextEvent = eventManager.peekNextEvent();
    
    if (!nextEvent) {
      return { 
        success: false, 
        message: "No upcoming events to forecast" 
      };
    }
    
    // Format the effects to show price movements
    let effectsText = '';
    if (nextEvent.effects && Array.isArray(nextEvent.effects) && nextEvent.effects.length > 0) {
      effectsText = '\n\n📊 Price Movements:\n' + nextEvent.effects.map(effect => {
        const sign = effect.priceChange >= 0 ? '+' : '';
        return `  ${effect.indexName}: ${sign}${effect.priceChange}`;
      }).join('\n');
    }
    
    // Include conditional effects if they exist
    let conditionalText = '';
    if (nextEvent.conditionalEffects && nextEvent.conditionalEffects.effects) {
      const timing = nextEvent.conditionalEffects.timing === 'end' ? 'End of round' : 'Next round';
      let probability = '';
      
      if (nextEvent.conditionalEffects.probability !== null && nextEvent.conditionalEffects.probability !== undefined) {
        probability = `${Math.round(nextEvent.conditionalEffects.probability * 100)}%`;
      } else if (nextEvent.conditionalEffects.dieRoll) {
        const dr = nextEvent.conditionalEffects.dieRoll;
        const total = dr.max - dr.min + 1;
        const successCount = dr.success.length;
        probability = `${Math.round((successCount / total) * 100)}%`;
      }
      
      const condEffects = nextEvent.conditionalEffects.effects.map(effect => {
        const sign = effect.priceChange >= 0 ? '+' : '';
        return `  ${effect.indexName}: ${sign}${effect.priceChange}`;
      }).join('\n');
      
      conditionalText = `\n\n⚠️ Potential Bubble (${timing}, ${probability}):\n${condEffects}`;
    }
    
    return {
      success: true,
      message: `Market Forecast reveals: ${nextEvent.name}${effectsText}${conditionalText}`,
      data: { event: nextEvent.toJSON() }
    };
  }

  /**
   * Market Uncertainty - Shuffle event deck
   */
  executeShuffle(context) {
    const { eventManager } = context;
    const shuffled = eventManager.shuffleEventDeck();
    
    if (!shuffled) {
      return {
        success: false,
        message: "Event deck cannot be shuffled"
      };
    }
    
    return {
      success: true,
      message: "Event deck shuffled! Forecasts are now useless."
    };
  }

  /**
   * Insider Trading - Buy stock at discount
   */
  executeInsiderTrading(context) {
    const { stock, playerName, tradingManager, indexes, roundNumber } = context;
    
    if (!stock) {
      return { 
        success: false, 
        message: "Must select a stock for insider trading" 
      };
    }

    // Calculate discounted price
    const discount = this.effectValue; // e.g., 3
    const result = tradingManager.purchaseStockWithDiscount(
      playerName, 
      stock, 
      indexes, 
      roundNumber,
      discount
    );
    
    // Add stock name to result data for tracking
    if (result.success && result.stock) {
      result.data = {
        ...result.data,
        stockName: stock.name,
        actionType: this.actionType
      };
    }
    
    return result;
  }

  /**
   * Market Manipulation - Spread rumor or create hype
   */
  executeManipulate(context) {
    const { stock, indexes, direction } = context; // direction: "up" or "down"
    
    if (!stock) {
      return { 
        success: false, 
        message: "Must select a stock to manipulate" 
      };
    }

    // Find the related index
    const relatedIndex = indexes.find(idx => idx.name === stock.industrySector);
    if (!relatedIndex) {
      return {
        success: false,
        message: "Could not find related market index"
      };
    }

    // Apply manipulation effect
    // effectValue sign determines direction: positive = up, negative = down
    const change = this.effectValue; // Use effectValue directly (positive = up, negative = down)
    const oldPrice = relatedIndex.price;
    relatedIndex.updatePrice(change);
    const newPrice = relatedIndex.price;

    // Determine verb based on effectValue sign
    const verb = this.effectValue > 0 ? "increased" : "decreased";
    
    return {
      success: true,
      message: `${this.name} on ${stock.name}! Stock price ${verb} by ${Math.abs(change)}`,
      data: {
        indexName: stock.industrySector,
        stockName: stock.name,
        oldPrice,
        newPrice,
        change,
        actionType: this.actionType,
        direction: this.effectValue > 0 ? "up" : "down" // Derive from effectValue sign
      }
    };
  }

  // Ensure proper JSON serialization
  toJSON() {
    return {
      name: this.name,
      description: this.description,
      actionType: this.actionType,
      targetType: this.targetType,
      effectValue: this.effectValue,
      id: this.id
    };
  }

  // Factory method to create action deck
  static createDeck() {
    const ActionData = require('./ActionData');
    const actions = ActionData.getAllActions();
    return actions.map(spec => new ActionCard(spec));
  }
}

// Export both class and action types for extensibility
module.exports = ActionCard;
module.exports.ACTION_TYPES = ACTION_TYPES;

