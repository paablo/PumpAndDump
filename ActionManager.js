const Deck = require('./Deck');
const ActionCard = require('./ActionCard');

/**
 * ActionManager - Manages the action card deck and execution
 * 
 * Handles:
 * - Action card deck initialization and drawing
 * - Action card execution (delegates to ActionCard.execute)
 * - Extensible to support any action type defined in ActionCard
 */
class ActionManager {
  constructor() {
    this.actionDeck = null;
  }

  /**
   * Initialize the action card deck
   */
  initialize() {
    const cards = ActionCard.createDeck();
    this.actionDeck = new Deck(cards);
    console.log(`Action deck initialized with ${this.actionDeck.length()} cards`);
  }

  /**
   * Draw a single action card from the deck
   */
  drawActionCard() {
    if (!this.actionDeck || this.actionDeck.isEmpty()) {
      console.log("Action deck is empty");
      return null;
    }
    return this.actionDeck.deal();
  }

  /**
   * Draw multiple action cards
   */
  drawMultipleCards(count) {
    const cards = [];
    for (let i = 0; i < count; i++) {
      const card = this.drawActionCard();
      if (card) cards.push(card);
    }
    return cards;
  }

  /**
   * Execute an action card
   * The ActionCard class handles the specific logic for each action type
   * This makes the system extensible - just add new execute methods to ActionCard
   */
  executeAction(actionCard, context) {
    if (!(actionCard instanceof ActionCard)) {
      return {
        success: false,
        message: "Invalid action card"
      };
    }

    return actionCard.execute(context);
  }

  /**
   * Get remaining cards in action deck
   */
  getActionDeckSize() {
    return this.actionDeck ? this.actionDeck.length() : 0;
  }

  /**
   * Check if action deck is empty
   */
  isActionDeckEmpty() {
    return !this.actionDeck || this.actionDeck.isEmpty();
  }
}

module.exports = ActionManager;

