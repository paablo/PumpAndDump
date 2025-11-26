export default class PlayingCardModel {
  constructor(card) {
    // ...existing code...
    // Support both legacy "Ace of Hearts" strings and server-side PlayingCard objects
    this.card = card;

    // Helper maps
    const nameToNumber = { Ace: 1, Jack: 11, Queen: 12, King: 13 };
    const numberToName = { 1: "Ace", 11: "Jack", 12: "Queen", 13: "King" };

    let displayValue = null;
    let numericValue = null;
    let suit = null;

    if (typeof card === "string") {
      // Legacy string: "Ace of Hearts"
      const parts = card.split(" of ");
      displayValue = parts[0];
      suit = parts[1];
      numericValue =
        typeof displayValue === "number"
          ? Number(displayValue)
          : nameToNumber[displayValue] || Number(displayValue);
    } else if (card && typeof card === "object") {
      // Server-side object (PlayingCard)
      // card.value may be a name ("Ace") or a number; card.rank (if present) is numeric 1-13
      suit = card.suit || null;
      if (card.value !== undefined && card.value !== null) {
        // value might be "Ace" or 2..10 or similar
        displayValue = card.value;
        numericValue =
          typeof card.value === "number"
            ? card.value
            : nameToNumber[card.value] || Number(card.value);
      } else if (card.rank !== undefined && card.rank !== null) {
        // fallback to rank property
        numericValue = Number(card.rank);
        displayValue = numberToName[numericValue] || numericValue;
      } else {
        // last resort: attempt to stringify
        displayValue = String(card);
        numericValue = NaN;
      }
    } else {
      // unknown format
      displayValue = String(card);
      numericValue = NaN;
      suit = null;
    }

    // normalized public properties used by the app
    this.value = numericValue;
    this.suit = suit;
    this.display = `${displayValue}${suit ? " of " + suit : ""}`;
    this.placeHolder = null;
    this.flipped = false;

    var suits = { Hearts: 0, Diamonds: 13, Clubs: 26, Spades: 39 };
    // keep existing position formula (preserves previous behaviour)
    this.position = (suits[this.suit] || 0) + (this.value || 0); // Position in a sorted deck
    this.backgroundPosition = -100 * this.position + "px";
  } //End of Constructor
} //End of Card class
