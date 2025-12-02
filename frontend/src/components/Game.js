import React, { useState, useEffect, useRef } from "react";

import Card from "./CardModel";
import PlayerHand from "./PlayerHand";
import GameHeader from "./GameHeader";
import MessageOverlay from "./MessageOverlay";
import IndexCardView from "./IndexCardView";
import StockCardView from "./StockCardView";
import EventsAndIndexes from "./EventsAndIndexes";

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
  const [visualEffects, setVisualEffects] = useState([]); // Combined effects for visual indicators
  const [gameLog, setGameLog] = useState([]);
  const [currentTurn, setCurrentTurn] = useState("");
  // player cash/wealth
  const [playerCash, setPlayerCash] = useState({});
  // player net worth (cash + stock value)
  const [playerNetWorths, setPlayerNetWorths] = useState({});
  // player portfolios (owned stocks)
  const [playerPortfolios, setPlayerPortfolios] = useState({});
  const [actionsRemaining, setActionsRemaining] = useState(2); // Actions left this turn (buy or sell)
  // stock ownership counts for price calculation
  const [stockOwnershipCounts, setStockOwnershipCounts] = useState({});
  // collapsible game log
  const [logExpanded, setLogExpanded] = useState(false);

  const [snackbars, setSnackbars] = useState([]);
  const [nextSnackbarId, setNextSnackbarId] = useState(0);
  
  const showMessage = (message, action = null) => {
    const id = nextSnackbarId;
    setNextSnackbarId(id + 1);
    setSnackbars(prev => [...prev, { id, message, action }]);
  };
  
  const handleSnackbarClose = (id) => {
    const snackbarToClose = snackbars.find(s => s.id === id);
    setSnackbars(prev => prev.filter(s => s.id !== id));
    
    if (snackbarToClose?.action && typeof snackbarToClose.action === "function") {
      snackbarToClose.action();
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
    socket.current.on("start_variables", ({ cards, playerNames, stocks, indexes, activeEvents, gameLog, playerCash, stockOwnershipCounts }) => {
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
      // store stock ownership counts
      setStockOwnershipCounts(stockOwnershipCounts || {});
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
      if (player_name === name) {
        showMessage(`It's your turn, ${player_name}!`);
        setMyTurn(true);
      }
    });

    // ending the game
    socket.current.on("end_game", (message) => {
      // Show message first, then logout after user dismisses
      showMessage(message, () => {
        socket.current.emit("leave_room", { name, room });
        setLoggedIn(false);
      });
      console.log("Game ended:", message);
    });

    // stocks update when new round starts
    socket.current.on("stocks_update", ({ stocks, indexes, activeEvents, visualEffects, gameLog, stockOwnershipCounts }) => {
      setStocks(Array.isArray(stocks) ? stocks : []);
      setIndexes(Array.isArray(indexes) ? indexes : []);
      setActiveEvents(Array.isArray(activeEvents) ? activeEvents : []);
      setVisualEffects(Array.isArray(visualEffects) ? visualEffects : []);
      setStockOwnershipCounts(stockOwnershipCounts || {});
      if (Array.isArray(gameLog)) {
        setGameLog(gameLog);
      }
      console.log("Stocks updated:", stocks);
      console.log("Indexes updated:", indexes);
      console.log("Active events:", activeEvents);
      console.log("Visual effects:", visualEffects);
      console.log("Stock ownership counts:", stockOwnershipCounts);
    });

    // event played notification
    socket.current.on("event_played", ({ event, indexes }) => {
      setActiveEvents((prev) => {
        const updated = [...prev, event];
        console.log("Event played - updating activeEvents:", updated);
        return updated;
      });
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

    // purchase result
    socket.current.on("purchase_result", ({ success, message, playerCash, ownedStocks, actionsRemaining }) => {
      if (success) {
        // Don't show success message - purchase is already logged in game log
      } else {
        // Only show error messages
        showMessage(`❌ ${message}`);
      }
      console.log("Purchase result:", success ? "Success" : message);
    });

    socket.current.on("show_message", (message) => {
      showMessage(`📢 ${message}`);
    });

    // sell result
    socket.current.on("sell_result", ({ success, message, playerCash, ownedStocks, salePrice, profit, actionsRemaining }) => {
      if (success) {
        // Don't show success message - sale is already logged in game log
      } else {
        // Only show error messages
        showMessage(`❌ ${message}`);
      }
      console.log("Sell result:", success ? `Sold for $${salePrice}, profit: $${profit}` : message);
    });

    // portfolio update (for all players)
    socket.current.on("portfolio_update", ({ playerName, ownedStocks }) => {
      setPlayerPortfolios(prev => ({
        ...prev,
        [playerName]: ownedStocks
      }));
      console.log(`Portfolio updated for ${playerName}:`, ownedStocks);
    });

    // game log update
    socket.current.on("game_log_update", (log) => {
      if (Array.isArray(log)) {
        setGameLog(log);
      }
    });

    // actions update (after buy/sell or new turn)
    socket.current.on("actions_update", ({ playerName, actionsRemaining }) => {
      if (playerName === name) {
        setActionsRemaining(actionsRemaining);
      }
      console.log(`Actions for ${playerName}: ${actionsRemaining}`);
    });

    // stock ownership update (after purchases)
    socket.current.on("stock_ownership_update", (counts) => {
      setStockOwnershipCounts(counts || {});
      console.log("Stock ownership updated:", counts);
    });

    // net worth update (after any financial transaction)
    socket.current.on("net_worth_update", (netWorths) => {
      setPlayerNetWorths(netWorths || {});
      console.log("Net worths updated:", netWorths);
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
      socket.current.off("purchase_result");
      socket.current.off("sell_result");
      socket.current.off("portfolio_update");
      socket.current.off("game_log_update");
      socket.current.off("round_update");
      socket.current.off("actions_update");
      socket.current.off("stock_ownership_update");
    };
  }, [socket.current]);

  useEffect(() => {
    if (myTurn && actionsRemaining === 0) {
      // Add a small delay to let the UI update before ending turn
      const timer = setTimeout(() => {
        console.log("All actions used - automatically ending turn");
        setMyTurn(false);
        socket.current.emit("turn_over", { room });
      }, 500); // 500ms delay for smooth UX
      
      return () => clearTimeout(timer);
    }
  }, [actionsRemaining, myTurn, room, socket]);

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

  const handlePurchaseStock = (stock) => {
    if (actionsRemaining <= 0) {
      // Don't show message - button should be disabled
      return;
    }

    socket.current.emit("purchase_stock", {
      room: room,
      playerName: name,
      stock: stock
    });
  };

  const handleSellStock = (stock) => {
    socket.current.emit("sell_stock", {
      room: room,
      playerName: name,
      stock: stock
    });
  };

  return (
    <div className="game">

  
    <EventsAndIndexes 
        activeEvents={activeEvents}
        indexes={indexes}
        styleCardSize={styleCardSize}
        visualEffects={visualEffects}
      />
  
      {/* Stock cards below */}
      <div className="shares" style={emptyStyles.shares}>
        <div className="playerCards" style={{ ...emptyStyles.cards, marginTop: 8 }}>
          {stocks.length === 0 ? (
            <div style={{ color: "#666", width: "100%", textAlign: "center" }}>No stocks shown</div>
          ) : (
            stocks.map((s, idx) => {
              const ownedStock = (playerPortfolios[name] || []).find(owned => owned.name === s.name);
              const canBuy = myTurn && actionsRemaining > 0;
              const canSellThis = myTurn && actionsRemaining > 0 && ownedStock;
              
              return (
                <StockCardView 
                  key={idx} 
                  stock={s} 
                  indexes={indexes} 
                  styleCardSize={styleCardSize}
                  onPurchase={handlePurchaseStock}
                  onSell={handleSellStock}
                  canPurchase={canBuy}
                  canSell={canSellThis}
                  ownedStock={ownedStock}
                  stockOwnershipCounts={stockOwnershipCounts}
                />
              );
            })
          )}
        </div>
      </div>
  
      <PlayerHand
        playerCards={playerCards}
        styleCardSize={styleCardSize}
        styles={emptyStyles}
      />
  
      <MessageOverlay
        snackbars={snackbars}
        handleSnackbarClose={handleSnackbarClose}
      />

      {/* Game Header */}
      <GameHeader
        roundNumber={roundNumber}
        players={players}
        currentTurn={currentTurn}
        name={name}
        playerCash={playerCash}
        playerNetWorths={playerNetWorths}
        updates={updates}
        gameLog={gameLog}
        logExpanded={logExpanded}
        setLogExpanded={setLogExpanded}
        ownedStocks={playerPortfolios[name] || []}
        actionsRemaining={actionsRemaining}
        onSellStock={handleSellStock}
        stockOwnershipCounts={stockOwnershipCounts}
        indexes={indexes}
        myTurn={myTurn}              // Add this
        endTurnHandler={endTurnHandler}  // Add this
        endGame={endGame}            // Add this
      />
    </div>
  );
};

export default Game;
