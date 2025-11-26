import React from "react";
import { Button } from "@material-ui/core";
import CardView from "./CardView";

const PlayerHand = ({
  playerCards,
  setThrowCard,
  myTurn,
  pick,
  canDeclare,
  declareHandler,
  endGame,
  styleCardSize,
  styles,
  nextButtonRef,
}) => {
  return (
    <div>
      <hr />
      Player's card:
      <div id="playerCards flex-centered">
        <div id="playercards" style={styles.cards}>
          {playerCards.map((card, index) => (
            <CardView
              key={index}
              card={card}
              id={"playerCard".concat((index + 1).toString())}
              onClick={setThrowCard}
              styleCardSize={styleCardSize}
            />
          ))}
        </div>
        <div className="flex-centered-column">
          <div className="button">
            <Button
              ref={nextButtonRef}
              variant="contained"
              disabled={!(myTurn && !pick && canDeclare)}
              onClick={declareHandler}
            >
              Declare
            </Button>
          </div>
          <div className="button">
            <Button variant="contained" onClick={endGame}>
              End game
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerHand;
