import React, { useState, useEffect, useRef } from "react";
import { Button, Snackbar } from "@material-ui/core";
import { grey } from "@material-ui/core/colors";

import ProfileCircle from "./ProfileCircle";
import Card from "./CardModel";
import CardView from "./CardView";
import RoundInfo from "./RoundInfo";
import Shares from "./Shares";
import Board from "./Board";
import PlayerHand from "./PlayerHand";
import Updates from "./Updates";

const Game = ({ socket, name, room, setLoggedIn, roundNumber }) => {
  const [updates, setUpdates] = useState([]);
  const [myTurn, setMyTurn] = useState(false);
  const [sendCard, setSendCard] = useState(-1);
  const [players, setPlayers] = useState([]);
  const [currentTurn, setCurrentTurn] = useState("");
  const [pick, setPick] = useState(false);
  const [pickOpen, setPickOpen] = useState(false);
  const [pickedOpen, setPickedOpen] = useState(null);
  const [canDeclare, setCanDeclare] = useState(true);
  const [colors, setColors] = useState([
    "#6272a4",
    "#50fa7b",
    "#ffb86c",
    "#ff79c6",
    "#ff5555",
  ]);

  // Add snackbar state for modern non-blocking messages and a pendingAction to emulate blocking alerts when needed
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const [pendingAction, setPendingAction] = useState(null);

  const showMessage = (message, action = null) => {
    setSnackbar({ open: true, message });
    setPendingAction(() => action);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar({ open: false, message: "" });
    if (typeof pendingAction === "function") {
      // call and clear
      pendingAction();
      setPendingAction(null);
    }
  };

  // Set card size limit to prevent overscaling
  const styleCardSize = { maxHeight: "150px", maxWidth: "105px" };

  const [opencard, setOpencard] = useState();
  const [playerCards, setPlayerCards] = useState([]);
  const [throwCards, setThrowCards] = useState([]);

  const nextButton = useRef(null);
  const throwing = useRef(null);

  // Add responsive styles
  const responsiveStyles = {
    game: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "10px",
    },
    roundInfo: {
      marginBottom: "10px",
      textAlign: "center",
    },
    players: {
      display: "flex",
      justifyContent: "center",
      flexWrap: "wrap",
      marginBottom: "20px",
    },
    board: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      marginBottom: "20px",
    },
    shares: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      marginBottom: "16px",
      width: "100%",
    },
    cards: {
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: "10px",
    },
    updates: {
      marginTop: "20px",
      width: "100%",
      maxWidth: "400px",
      textAlign: "center",
    },
  };

  // Add overlay and snackbar-specific styles
  const overlayStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.25)",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
    zIndex: 1400, // below snackbar
  };

  const snackbarContentStyle = {
    padding: "18px 28px",
    minWidth: "420px",
    maxWidth: "90vw",
    borderRadius: 8,
    boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
  };

  const snackbarMessageStyle = {
    fontSize: "1.15rem",
    lineHeight: 1.2,
    textAlign: "center",
    color: "#fff",
    width: "100%",
    display: "block",
  };

  useEffect(() => {
    // Starting values of opnecard, player cards and player names
    socket.current.on("start_variables", ({ opencard, cards, playerNames }) => {
      setOpencard(new Card(opencard));
      let tempCards = [];
      for (let i = 0; i < cards.length; i++) {
        tempCards.push(new Card(cards[i]));
      }
      setPlayerCards(tempCards);
      setPlayers(playerNames);
    });

    // get opencard after every turn
    socket.current.on("open_card", (card) => {
      setOpencard(new Card(card));
    });

    // Updates after any move
    socket.current.on("update", ({ name, send, length }) => {
      // Format send (accept string or server-side object)
      const sendStr =
        typeof send === "string"
          ? send
          : send && send.value && send.suit
          ? `${send.value} of ${send.suit}`
          : JSON.stringify(send);
      setUpdates((updates) => [...updates, `${name} threw ${sendStr}(${length})`]);
    });

    // change of turn
    socket.current.on("your_turn", (player_name) => {
      setCurrentTurn(player_name);
      setCanDeclare(true);
      if (player_name === name) {
        setMyTurn(true);
      }
    });

    // ending the game
    socket.current.on("end_game", (message) => {
      setLoggedIn(false);
      socket.current.emit("leave_room", { name, room });
      // replaced blocking alert with toast
      showMessage(`${message}`);
    });

    // getting the picked card
    socket.current.on("picked_card", (card) => {
      let newcard = new Card(card);
      setPlayerCards((playerCards) => [...playerCards, newcard]);
      setThrowCards([]);
    });

    // result of declaration
    socket.current.on("declare_result", (result) => {
      // show result in toast and emit start_game after toast closes
      showMessage(result, () => socket.current.emit("start_game", room));
    });
  }, [socket.current]);

  useEffect(() => {
    let handValue = getHandValue();
    socket.current.emit("hand_value", { handValue, room });
  }, [playerCards]);

  useEffect(() => {
    if (throwCards.length > 0) {
      setCanDeclare(false);
    } else {
      setCanDeclare(true);
    }
  }, [throwCards]);

  const throwHandler = () => {
    if (sendCard === -1) {
      showMessage("Choose a card to throw");
    } else {
      let update = `${name} threw ${throwCards[0].card}`;
      setPick(true);
      for (let i = 0; i < playerCards.length; i++) {
        if (playerCards[i].value === opencard.value) {
          setPickOpen(true);
        }
      }
    }
  }; //End of throwHandler()

  const pickHandler = (pickedOption) => {
    setPick(false);
    setMyTurn(false);
    setPickOpen(false);
    setPickedOpen(null);
    let send = throwCards[0].card;

    if (pickedOption === "opencard") {
      setPickedOpen(opencard.value);
    }

    socket.current.emit("turn_over", { room, pickedOption });
    let length = throwCards.length;
    socket.current.emit("click", { name, room, send, length });
  };

  const declareHandler = () => {
    const handValue = getHandValue();
    socket.current.emit("declare", { handValue, room });
  };

  const getHandValue = () => {
    let handValue = 0;
    for (let i = 0; i < playerCards.length; i++) {
      handValue += playerCards[i].value;
    }

    return handValue;
  };

  const setThrowCard = (e) => {
    if (!myTurn) {
      return;
    }
    if (getHandValue() === 1) {
      // replaced blocking alert
      showMessage("You have to declare because you only have an Ace");
      return;
    }
    if (e.target.parentElement.id === "throw") {
      setSendCard(-1);
      const tempArr = [...throwCards];
      setPlayerCards([
        ...playerCards,
        tempArr.splice(parseInt(e.target.id.substring(10) - 1), 1)[0],
      ]);
      setThrowCards(tempArr);
    } else {
      if (pickedOpen !== null) {
        if (playerCards[e.target.id.substring(10) - 1].value !== pickedOpen) {
          showMessage(
            "You can only throw the card that you have picked in the previous round"
          );
          return null;
        }
      }
      if (throwCards.length === 0) {
        setSendCard(parseInt(e.target.id.substring(10)) - 1);
        const tempArr = [...playerCards];
        setThrowCards([
          ...throwCards,
          tempArr.splice(parseInt(e.target.id.substring(10) - 1), 1)[0],
        ]);
        setPlayerCards(tempArr);
      } else {
        if (
          playerCards[parseInt(e.target.id.substring(10) - 1)].value ===
          throwCards[0].value
        ) {
          const tempArr = [...playerCards];
          setThrowCards([
            ...throwCards,
            tempArr.splice(parseInt(e.target.id.substring(10) - 1), 1)[0],
          ]);
          setPlayerCards(tempArr);
        } else {
          showMessage("Cards don't have the same value");
        }
      }
    }
  }; // End of setThrowCard

  const endGame = () => {
    setLoggedIn(false);
    socket.current.emit("end_game", room);
  };

  return (
    <div className="game" style={responsiveStyles.game}>
      <RoundInfo roundNumber={roundNumber} styles={responsiveStyles} />
      <div className="players flex-centered" style={responsiveStyles.players}>
        {players.map((player) => (
          <ProfileCircle name={player} currentName={currentTurn} color={grey[900]} />
        ))}
      </div>
      <hr />
      <Shares styleCardSize={styleCardSize} styles={responsiveStyles} />
      <hr />
      <Board
        opencard={opencard}
        throwCards={throwCards}
        pick={pick}
        myTurn={myTurn}
        pickOpen={pickOpen}
        pickHandler={pickHandler}
        throwHandler={throwHandler}
        setThrowCard={setThrowCard}
        styleCardSize={styleCardSize}
        throwingRef={throwing}
        styles={responsiveStyles}
      />
      <PlayerHand
        playerCards={playerCards}
        setThrowCard={setThrowCard}
        myTurn={myTurn}
        pick={pick}
        canDeclare={canDeclare}
        declareHandler={declareHandler}
        endGame={endGame}
        styleCardSize={styleCardSize}
        styles={responsiveStyles}
        nextButtonRef={nextButton}
      />
      <Updates updates={updates} styles={responsiveStyles} />

      {/* Blurred overlay while snackbar is open */}
      {snackbar.open && <div style={overlayStyle} />}

      {/* Snackbar for modern non-blocking messages */}
      <Snackbar
        anchorOrigin={{ vertical: "center", horizontal: "center" }}
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        message={<span style={snackbarMessageStyle}>{snackbar.message}</span>}
        ContentProps={{ style: snackbarContentStyle }}
        // ensure it's above the overlay
        style={{ zIndex: 1401 }}
      />
    </div>
  );
};

export default Game;
