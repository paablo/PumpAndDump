/**
 * ActionData - Defines all action cards in the game
 * 
 * To add new action types:
 * 1. Define the action type in ActionCard.js ACTION_TYPES
 * 2. Implement execute method in ActionCard.js
 * 3. Add card definitions here
 * 4. Update frontend ActionCardView.js for styling
 */

const ACTION_CARDS = [
  // Market Forecast cards (4x)
  {
    name: "Market Forecast",
    description: "Peek at the next event card to predict market movements.",
    actionType: "forecast",
    targetType: "none",
    effectValue: 0
  },
  {
    name: "Market Forecast",
    description: "Peek at the next event card to predict market movements.",
    actionType: "forecast",
    targetType: "none",
    effectValue: 0
  },
  {
    name: "Market Forecast",
    description: "Peek at the next event card to predict market movements.",
    actionType: "forecast",
    targetType: "none",
    effectValue: 0
  },
  {
    name: "Market Forecast",
    description: "Peek at the next event card to predict market movements.",
    actionType: "forecast",
    targetType: "none",
    effectValue: 0
  },
  
  // Market Uncertainty cards (2x)
  {
    name: "Market Uncertainty",
    description: "Shuffle the event deck, preventing all forecasts.",
    actionType: "shuffle",
    targetType: "none",
    effectValue: 0
  },
  {
    name: "Market Uncertainty",
    description: "Shuffle the event deck, preventing all forecasts.",
    actionType: "shuffle",
    targetType: "none",
    effectValue: 0
  },
  
  // Insider Trading cards (3x)
  {
    name: "Insider Trading",
    description: "Buy a stock at $3 discount. Includes the purchase action.",
    actionType: "insider_trading",
    targetType: "stock",
    effectValue: 3 // discount amount
  },
  {
    name: "Insider Trading",
    description: "Buy a stock at $3 discount. Includes the purchase action.",
    actionType: "insider_trading",
    targetType: "stock",
    effectValue: 3
  },
  {
    name: "Insider Trading",
    description: "Buy a stock at $3 discount. Includes the purchase action.",
    actionType: "insider_trading",
    targetType: "stock",
    effectValue: 3
  },
  
  // Create Hype cards (4x)
  {
    name: "Create Hype",
    description: "Add 2 value to a stock's market index.",
    actionType: "manipulate",
    targetType: "stock",
    effectValue: 2
  },
  {
    name: "Create Hype",
    description: "Add 2 value to a stock's market index.",
    actionType: "manipulate",
    targetType: "stock",
    effectValue: 2
  },
  {
    name: "Create Hype",
    description: "Add 2 value to a stock's market index.",
    actionType: "manipulate",
    targetType: "stock",
    effectValue: 2
  },
  {
    name: "Create Hype",
    description: "Add 2 value to a stock's market index.",
    actionType: "manipulate",
    targetType: "stock",
    effectValue: 2
  },
  
  // Spread Rumor cards (4x) - Negative effectValue for down manipulation
  {
    name: "Spread Rumor",
    description: "Reduce a stock's market index by 2.",
    actionType: "manipulate",
    targetType: "stock",
    effectValue: -2
  },
  {
    name: "Spread Rumor",
    description: "Reduce a stock's market index by 2.",
    actionType: "manipulate",
    targetType: "stock",
    effectValue: -2
  },
  {
    name: "Spread Rumor",
    description: "Reduce a stock's market index by 2.",
    actionType: "manipulate",
    targetType: "stock",
    effectValue: -2
  },
  {
    name: "Spread Rumor",
    description: "Reduce a stock's market index by 2.",
    actionType: "manipulate",
    targetType: "stock",
    effectValue: -2
  },
  
  // Scandal cards (2x) - Strong negative manipulation
  {
    name: "Scandal",
    description: "Reduce a stock's market index by 4.",
    actionType: "manipulate",
    targetType: "stock",
    effectValue: -4
  },
  {
    name: "Scandal",
    description: "Reduce a stock's market index by 4.",
    actionType: "manipulate",
    targetType: "stock",
    effectValue: -4
  },
  
  // Hysteria cards (2x) - Strong positive manipulation
  {
    name: "Hysteria",
    description: "Add 4 value to a stock's market index.",
    actionType: "manipulate",
    targetType: "stock",
    effectValue: 4
  },
  {
    name: "Hysteria",
    description: "Add 4 value to a stock's market index.",
    actionType: "manipulate",
    targetType: "stock",
    effectValue: 4
  }
];

/**
 * Get all action card definitions
 */
function getAllActions() {
  return ACTION_CARDS;
}

module.exports = { getAllActions };

