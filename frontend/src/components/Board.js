import React from "react";
import { Button } from "@material-ui/core";
import CardView from "./CardView";

const Board = ({
  opencard,
  throwCards,
  pick,
  myTurn,
  pickOpen,
  pickHandler,
  throwHandler,
  setThrowCard,
  styleCardSize,
  throwingRef,
  styles,
}) => {
  return (
    <div className="flex-centered" style={styles.board}>
      <div id="cards" style={styles.cards}>
        Board:
        <div id="board" className="flex-centered">
          <div className="flex-centered-column button">
            <div id="deck" className="card" style={styleCardSize}></div>
            <Button
              variant="contained"
              onClick={() => {
                pickHandler("deck");
              }}
              disabled={!(myTurn && pick)}
            >
              pick from deck
            </Button>
          </div>
          <div className="flex-centered-column button">
            {opencard ? (
              <CardView card={opencard} id="opencard" styleCardSize={styleCardSize} />
            ) : (
              <div></div>
            )}
            <Button
              variant="contained"
              onClick={() => {
                pickHandler("opencard");
              }}
              disabled={!(myTurn && pick && pickOpen)}
            >
              pick open card
            </Button>
          </div>
          <div className="flex-centered-column button">
            <div className="throw" id="throw" ref={throwingRef} style={{ height: "100%" }}>
              {throwCards.map((card, index) => (
                <CardView
                  key={index}
                  card={card}
                  id={"playerCard".concat((index + 1).toString())}
                  onClick={setThrowCard}
                  styleCardSize={styleCardSize}
                />
              ))}
            </div>
            <Button variant="contained" onClick={throwHandler} disabled={!(myTurn && !pick)}>
              throw
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Board;
