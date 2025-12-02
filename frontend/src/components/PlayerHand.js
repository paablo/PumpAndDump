import React from "react";
import { Button } from "@material-ui/core";
import CardView from "./CardView";

const PlayerHand = ({
  playerCards,
  myTurn,
  endTurnHandler,
  endGame,
  styleCardSize,
  styles,
  nextButtonRef,
}) => {
  // Add small layout styles to prevent overlap
  const containerStyle = {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "12px",
    width: "100%",
  };

  const cardsContainerStyle = {
    // keep any styles passed in, but ensure layout prevents overlap
    ...(typeof styles === "object" ? styles.cards : {}),
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    flex: "1 1 auto",
    minWidth: 0, // allow shrinking in flex layouts
    overflow: "auto",
  };

  const buttonsColumnStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    flex: "0 0 auto", // keep buttons column from shrinking
    marginLeft: "8px",
  };

  return (
    <div>
      {/* use className (no spaces in id) and apply containerStyle */}
      <div className="playerCards flex-centered" style={containerStyle}>
        <div id="playercards" style={cardsContainerStyle}>
          {playerCards.map((card, index) => (
            <CardView
              key={index}
              card={card}
              id={"playerCard".concat((index + 1).toString())}
              styleCardSize={styleCardSize}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlayerHand;
