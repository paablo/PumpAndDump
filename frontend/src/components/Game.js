import React, { useState, useEffect, useRef } from "react";
import { Snackbar } from "@material-ui/core";

import Card from "./CardModel";
import Shares from "./Shares";
import PlayerHand from "./PlayerHand";

const Game = ({ socket, name, room, setLoggedIn, roundNumber }) => {
  const [updates, setUpdates] = useState([]);
  const [myTurn, setMyTurn] = useState(false);
  const [players, setPlayers] = useState([]);
  // add stocks state to show stockcards sent by server
  const [stocks, setStocks] = useState([]);
  // new: track indexes sent from server
  const [indexes, setIndexes] = useState([]);
  // event system
  const [activeEvents, setActiveEvents] = useState([]);
  const [gameLog, setGameLog] = useState([]);
  const [currentTurn, setCurrentTurn] = useState("");
  // player cash/wealth
  const [playerCash, setPlayerCash] = useState({});
  // collapsible game log
  const [logExpanded, setLogExpanded] = useState(true);

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

  // Set card size for stock/index cards
  const styleCardSize = { width: "200px", height: "280px" };

  const [playerCards, setPlayerCards] = useState([]);

  const nextButton = useRef(null);

  // Removed responsiveStyles, overlayStyle, snackbarContentStyle, snackbarMessageStyle
  // Styles moved to App.css. Children still receive an empty styles object to avoid breaking API.
  const emptyStyles = {};

  useEffect(() => {
    // Starting values of player cards and player names
    socket.current.on("start_variables", ({ cards, playerNames, stocks, indexes, activeEvents, gameLog, playerCash }) => {
      let tempCards = [];
      for (let i = 0; i < cards.length; i++) {
        tempCards.push(new Card(cards[i]));
      }
      setPlayerCards(tempCards);
      setPlayers(playerNames);
      // store raw stock objects (server sends basic stock data)
      setStocks(Array.isArray(stocks) ? stocks : []);
      // store indexes from server
      setIndexes(Array.isArray(indexes) ? indexes : []);
      // store events and game log
      setActiveEvents(Array.isArray(activeEvents) ? activeEvents : []);
      setGameLog(Array.isArray(gameLog) ? gameLog : []);
      // store player cash
      setPlayerCash(playerCash || {});
    });

    // cash update
    socket.current.on("cash_update", (cash) => {
      setPlayerCash(cash || {});
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
      //setCanDeclare(true);
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

    // stocks update when new round starts
    socket.current.on("stocks_update", ({ stocks, indexes, activeEvents, gameLog }) => {
      setStocks(Array.isArray(stocks) ? stocks : []);
      setIndexes(Array.isArray(indexes) ? indexes : []);
      setActiveEvents(Array.isArray(activeEvents) ? activeEvents : []);
      if (Array.isArray(gameLog)) {
        setGameLog(gameLog);
      }
      console.log("Stocks updated:", stocks);
      console.log("Indexes updated:", indexes);
      console.log("Active events:", activeEvents);
    });

    // event played notification
    socket.current.on("event_played", ({ event, indexes }) => {
      setActiveEvents((prev) => [...prev, event]);
      setIndexes(Array.isArray(indexes) ? indexes : []);
      showMessage(`📰 Event: ${event.name} - ${event.description}`);
      console.log("Event played:", event);
    });

    // conditional event triggered
    socket.current.on("event_triggered", ({ event, roll, results, indexes }) => {
      setIndexes(Array.isArray(indexes) ? indexes : []);
      const changes = results.map(r => {
        const sign = r.priceChange >= 0 ? '+' : '';
        return `${r.indexName} ${sign}${r.priceChange}`;
      }).join(', ');
      let message = `🎲 ${event.name} triggered: ${changes}`;
      if (roll !== null) {
        message += ` [Roll: ${roll}]`;
      }
      showMessage(message);
      console.log("Event triggered:", event, roll, results);
    });

    // round message
    socket.current.on("round_message", ({ round, message, indexes, activeEvents, recentLog }) => {
      setIndexes(Array.isArray(indexes) ? indexes : []);
      setActiveEvents(Array.isArray(activeEvents) ? activeEvents : []);
      if (Array.isArray(recentLog)) {
        setGameLog(recentLog);
      }
      showMessage(message);
      console.log("Round message:", message);
    });

    return () => {
      socket.current.off("start_variables");
      socket.current.off("update");
      socket.current.off("your_turn");
      socket.current.off("end_game");
      socket.current.off("stocks_update");
      socket.current.off("event_played");
      socket.current.off("event_triggered");
      socket.current.off("round_message");
      socket.current.off("cash_update");
    };
  }, [socket.current]);

  const endTurnHandler = () => {
    if (!myTurn) {
      showMessage("It's not your turn!");
      return;
    }
    
    setMyTurn(false);
    // Notify server that turn is over
    socket.current.emit("turn_over", { room });
  };

  const endGame = () => {
    setLoggedIn(false);
    socket.current.emit("end_game", room);
  };

  // Get the most recent log entry (market news prioritized over player updates)
  const getLastLogEntry = () => {
    if (gameLog.length > 0) {
      const lastLog = gameLog[gameLog.length - 1];
      return `R${lastLog.round}: ${lastLog.message}`;
    }
    if (updates.length > 0) {
      return updates[updates.length - 1];
    }
    return "No recent activity";
  };

  return (
    <div className="game">
      {/* Enhanced Header with Round Info, Player Wealth, and Collapsible Log */}
      <div className="game-header">
        <div className="game-info-bar">
          <div className="round-badge">
            Round {roundNumber}
          </div>
          <div className="players-wealth">
            {players.map((player, idx) => (
              <div 
                key={idx} 
                className={`player-wealth-item ${player === currentTurn ? 'active' : ''} ${player === name ? 'current-player' : ''}`}
              >
                <span className="player-name">
                  {player === currentTurn && '▶ '}
                  {player}
                  {player === name && ' (You)'}
                </span>
                <span className="player-cash">
                  💰 ${playerCash[player] !== undefined ? playerCash[player] : 30}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Collapsible Game Log - Integrated into banner */}
        {(updates.length > 0 || gameLog.length > 0) && (
          <div className="game-log-banner">
            <div 
              className="log-banner-header clickable" 
              onClick={() => setLogExpanded(!logExpanded)}
            >
              <span className="log-banner-icon">📊</span>
              {logExpanded ? (
                <span className="log-banner-title">Game Log & Market News</span>
              ) : (
                <span className="log-banner-preview">{getLastLogEntry()}</span>
              )}
              <span className="collapse-icon">{logExpanded ? '▼' : '▶'}</span>
            </div>
            {logExpanded && (
              <div className="log-list">
                {/* Market News from backend */}
                {gameLog.length > 0 && gameLog.slice(-5).reverse().map((entry, index) => (
                  <div key={`log-${index}`} className="log-item log-market">
                    <span className="log-round">R{entry.round}</span>
                    <span className="log-message">{entry.message}</span>
                  </div>
                ))}
                
                {/* Player updates */}
                {updates.length > 0 && updates.slice(-5).reverse().map((update, index) => (
                  <div key={`update-${index}`} className="log-item log-player">
                    <span className="log-icon">🎴</span>
                    <span className="log-message">{update}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Active Events Display - Above Index Cards */}
      {activeEvents.filter(e => e.status !== 'resolved').length > 0 && (
        <div className="active-events-section">
          <div className="events-header">🎪 Active Events</div>
          <div className="events-list">
            {activeEvents.filter(e => e.status !== 'resolved').map((event, index) => {
              // Calculate effect summary for display
              const initialEffects = event.effects.map(eff => {
                const sign = eff.priceChange >= 0 ? '+' : '';
                return `${eff.indexName} ${sign}${eff.priceChange}`;
              }).join(', ');

              let conditionalInfo = '';
              if (event.conditionalEffects) {
                const condEffects = event.conditionalEffects.effects.map(eff => {
                  const sign = eff.priceChange >= 0 ? '+' : '';
                  return `${eff.indexName} ${sign}${eff.priceChange}`;
                }).join(', ');
                
                let probability = '';
                if (event.conditionalEffects.probability !== null) {
                  probability = `${Math.round(event.conditionalEffects.probability * 100)}%`;
                } else if (event.conditionalEffects.dieRoll) {
                  const dr = event.conditionalEffects.dieRoll;
                  const total = dr.max - dr.min + 1;
                  const successCount = dr.success.length;
                  probability = `${successCount}/${total} (${Math.round(successCount/total*100)}%)`;
                }
                
                conditionalInfo = ` | Next ${event.conditionalEffects.timing}: ${condEffects} (${probability})`;
              }

              return (
                <div key={index} className="event-card">
                  <div className="event-name">{event.name}</div>
                  <div className="event-description">{event.description}</div>
                  <div className="event-effects">
                    📊 Effects: {initialEffects}
                    {conditionalInfo}
                  </div>
                  <div className="event-status">
                    Status: {event.status.toUpperCase()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* pass stocks and indexes to Shares so it can render stockcards and index prices */}
      <Shares styleCardSize={styleCardSize} styles={emptyStyles} stocks={stocks} indexes={indexes} activeEvents={activeEvents} />

      <PlayerHand
        playerCards={playerCards}
        myTurn={myTurn}
        endTurnHandler={endTurnHandler}
        endGame={endGame}
        styleCardSize={styleCardSize}
        styles={emptyStyles}
        nextButtonRef={nextButton}
      />

      {/* Blurred overlay while snackbar is open */}
      {snackbar.open && <div className="overlay" />}

      {/* Snackbar for modern non-blocking messages */}
      <Snackbar
        anchorOrigin={{ vertical: "center", horizontal: "center" }}
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        message={<span className="snackbar-message">{snackbar.message}</span>}
        ContentProps={{ className: "snackbar-content" }}
        className="snackbar-fixed"
      />
    </div>
  );
};

export default Game;
