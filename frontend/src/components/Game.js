import React, { useState, useEffect } from "react";
import GameHeader from "./GameHeader";
import MessageOverlay from "./MessageOverlay";
import EventsColumn from "./EventsColumn";
import StocksColumn from "./StocksColumn";
import PlayerHandOverlay from "./PlayerHandOverlay";

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
  const [actionsRemaining, setActionsRemaining] = useState({}); // Actions left this turn per player: { playerName: count }
  // stock ownership counts for price calculation
  const [stockOwnershipCounts, setStockOwnershipCounts] = useState({});
  // stock ownership by player (for showing tokens)
  const [stockOwnershipByPlayer, setStockOwnershipByPlayer] = useState({});
  // player colors and emojis
  const [playerColors, setPlayerColors] = useState({});
  const [playerEmojis, setPlayerEmojis] = useState({});
  // collapsible game log
  const [logExpanded, setLogExpanded] = useState(false);
  // action cards state
  const [playerActionCards, setPlayerActionCards] = useState([]);
  const [selectedActionCard, setSelectedActionCard] = useState(null);
  const [actionMode, setActionMode] = useState(null); // "selecting_stock_up", "selecting_stock_down", null

  const [snackbars, setSnackbars] = useState([]);
  const [nextSnackbarId, setNextSnackbarId] = useState(0);
  const [hasJoinedGame, setHasJoinedGame] = useState(false); // Track if player has joined the game
  
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

  useEffect(() => {
    // Starting values of player cards and player names
    socket.current.on("start_variables", ({ playerNames, stocks, indexes, activeEvents, gameLog, playerCash, stockOwnershipCounts, stockOwnershipByPlayer, playerColors, playerEmojis, actionCards }) => {
      setHasJoinedGame(true); // Mark as joined when game starts
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
      // store stock ownership by player
      setStockOwnershipByPlayer(stockOwnershipByPlayer || {});
      // store player colors and emojis
      setPlayerColors(playerColors || {});
      setPlayerEmojis(playerEmojis || {});
      // store action cards
      setPlayerActionCards(Array.isArray(actionCards) ? actionCards : []);
      
      // Show game rules when game starts
      const rulesMessage = `🎮 GAME RULES 🎮

📊 OBJECTIVE: Finish with the highest net worth (cash + stock value) to win!

🔄 TURNS & ACTIONS:
• Each player gets 3 actions per turn
• Actions can be used to: Buy stocks, Sell stocks, or Draw action cards
• When your turn starts, you'll see your actions remaining (⚡)

💰 STOCKS:
• Stock price = Base Cost + Index Price + (Growth × Shares Owned)
• Each stock pays dividends every 2 rounds (even rounds)
• Growth increases price based on total shares owned by all players

📈 INDEXES:
• Index prices change based on events
• Each stock belongs to an index sector (Tech, Finance, Industrial, Health & Science)

📰 EVENTS:
• Events affect index prices when triggered
• Some events have conditional effects (bubble pops) that trigger later

🎴 ACTION CARDS:
• Draw action cards from the deck (max 4 in hand)
• Use action cards to manipulate the market:
  - Forecast: See upcoming events
  - Shuffle: Reshuffle event deck
  - Manipulate: Change stock prices
  - Insider Trading: Buy stocks at a discount

🏆 WINNING:
• After 6 rounds, the player with the highest net worth wins!

Good luck! 🚀`;
      
      showMessage(rulesMessage);
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
    socket.current.on("stocks_update", ({ stocks, indexes, activeEvents, visualEffects, gameLog, stockOwnershipCounts, stockOwnershipByPlayer }) => {
      // Debug: Check for applied action cards
      const stocksWithCards = stocks?.filter(s => s.appliedActionCards && s.appliedActionCards.length > 0);
      console.log('[Game.js] stocks_update received. Stocks with appliedActionCards:', stocksWithCards);
      
      setStocks(Array.isArray(stocks) ? stocks : []);
      setIndexes(Array.isArray(indexes) ? indexes : []);
      setActiveEvents(Array.isArray(activeEvents) ? activeEvents : []);
      setVisualEffects(Array.isArray(visualEffects) ? visualEffects : []);
      setStockOwnershipCounts(stockOwnershipCounts || {});
      setStockOwnershipByPlayer(stockOwnershipByPlayer || {});
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
        if (message && message.includes("Room not found")) {
          showMessage("❌ Connection to room lost. Returning to home page...", () => {
            setLoggedIn(false);
          });
        } else {
          showMessage(`❌ ${message}`);
        }
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
        if (message && message.includes("Room not found")) {
          showMessage("❌ Connection to room lost. Returning to home page...", () => {
            setLoggedIn(false);
          });
        } else {
          showMessage(`❌ ${message}`);
        }
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
    socket.current.on("actions_update", ({ playerName, actionsRemaining: count }) => {
      setActionsRemaining(prev => ({
        ...prev,
        [playerName]: count
      }));
      console.log(`Actions for ${playerName}: ${count}`);
    });

    // stock ownership update (after purchases)
    socket.current.on("stock_ownership_update", (counts) => {
      setStockOwnershipCounts(counts || {});
      console.log("Stock ownership updated:", counts);
    });

    // stock ownership by player update (after purchases)
    socket.current.on("stock_ownership_by_player_update", (ownership) => {
      setStockOwnershipByPlayer(ownership || {});
      console.log("Stock ownership by player updated:", ownership);
    });

    // player colors and emojis update
    socket.current.on("player_colors", (colors) => {
      setPlayerColors(colors || {});
    });

    socket.current.on("player_emojis", (emojis) => {
      setPlayerEmojis(emojis || {});
    });

    // net worth update (after any financial transaction)
    socket.current.on("net_worth_update", (netWorths) => {
      setPlayerNetWorths(netWorths || {});
      console.log("Net worths updated:", netWorths);
    });

    // action cards update
    socket.current.on("action_cards_update", ({ playerName, actionCards }) => {
      if (playerName === name) {
        setPlayerActionCards(Array.isArray(actionCards) ? actionCards : []);
      }
    });

    // action result
    socket.current.on("action_result", ({ success, message, data }) => {
      if (success) {
        // Handle specific action results
        if (data?.event) {
          // Market Forecast result
          showMessage(`${message}\n"${data.event.description}"`);
        } else {
          showMessage(`✅ ${message}`);
        }
        
        // Reset action mode
        setSelectedActionCard(null);
        setActionMode(null);
      } else {
        if (message && message.includes("Room not found")) {
          showMessage("❌ Connection to room lost. Returning to home page...", () => {
            setLoggedIn(false);
          });
        } else {
          showMessage(`❌ ${message}`);
        }
      }
    });

    // draw action card result
    socket.current.on("draw_action_result", ({ success, message }) => {
      if (!success) {
        if (message && message.includes("Room not found")) {
          showMessage("❌ Connection to room lost. Returning to home page...", () => {
            setLoggedIn(false);
          });
        } else {
          showMessage(`❌ ${message}`);
        }
      }
    });

    // Connection lost/disconnect handler - only show if player has joined game
    socket.current.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      if (hasJoinedGame) {
        showMessage("❌ Connection to server lost. Returning to home page...", () => {
          setLoggedIn(false);
        });
      } else {
        // If not joined yet, just silently return to home
        setLoggedIn(false);
      }
    });

    socket.current.on("connect_error", (error) => {
      console.log("Connection error:", error);
      // Only show error if player has joined game
      if (hasJoinedGame) {
        showMessage("❌ Failed to connect to server. Returning to home page...", () => {
          setLoggedIn(false);
        });
      } else {
        // If not joined yet, just silently return to home
        setLoggedIn(false);
      }
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
      socket.current.off("stock_ownership_by_player_update");
      socket.current.off("player_colors");
      socket.current.off("player_emojis");
      socket.current.off("action_cards_update");
      socket.current.off("action_result");
      socket.current.off("draw_action_result");
      socket.current.off("disconnect");
      socket.current.off("connect_error");
    };
  }, [socket.current, name, setLoggedIn, showMessage, hasJoinedGame]);

  useEffect(() => {
    const myActions = actionsRemaining[name] || 0;
    if (myTurn && myActions === 0) {
      // Add a small delay to let the UI update before ending turn
      const timer = setTimeout(() => {
        console.log("All actions used - automatically ending turn");
        setMyTurn(false);
        socket.current.emit("turn_over", { room });
      }, 500); // 500ms delay for smooth UX
      
      return () => clearTimeout(timer);
    }
  }, [actionsRemaining, name, myTurn, room, socket]);

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

  // Action card handlers
  const handleSelectActionCard = (actionCard) => {
    const myActions = actionsRemaining[name] || 0;
    if (!myTurn || myActions <= 0) return;
    
    if (selectedActionCard?.id === actionCard.id) {
      // Deselect
      setSelectedActionCard(null);
      setActionMode(null);
    } else {
      // Select new card
      setSelectedActionCard(actionCard);
      
      // Determine action mode based on card type
      if (actionCard.targetType === "stock") {
        if (actionCard.actionType === "manipulate") {
          // For manipulation, determine direction based on effectValue sign
          // Positive effectValue = up (increase), negative = down (decrease)
          const isPositive = actionCard.effectValue > 0;
          if (isPositive) {
            setActionMode("selecting_stock_up");
            showMessage(`Select a stock to increase its price by ${actionCard.effectValue}`);
          } else {
            setActionMode("selecting_stock_down");
            showMessage(`Select a stock to decrease its price by ${Math.abs(actionCard.effectValue)}`);
          }
        } else if (actionCard.actionType === "insider_trading") {
          setActionMode("selecting_stock_buy");
          showMessage(`Select a stock to buy at $${actionCard.effectValue} discount`);
        }
      } else if (actionCard.targetType === "none") {
        // Execute immediately for non-targeted actions
        executeActionCard(actionCard);
      }
    }
  };

  const executeActionCard = (actionCard, target = null, direction = null) => {
    socket.current.emit("play_action_card", {
      room: room,
      playerName: name,
      cardId: actionCard.id,
      target: target,
      direction: direction
    });
  };

  const handlePurchaseStock = (stock) => {
    // Check if we're in action card mode
    if (selectedActionCard) {
      if (selectedActionCard.actionType === "insider_trading") {
        executeActionCard(selectedActionCard, stock);
        return;
      } else if (selectedActionCard.actionType === "manipulate" && actionMode === "selecting_stock_up") {
        executeActionCard(selectedActionCard, stock, "up");
        return;
      }
    }
    
    // Normal purchase logic
    const myActions = actionsRemaining[name] || 0;
    if (myActions <= 0) {
      return;
    }

    socket.current.emit("purchase_stock", {
      room: room,
      playerName: name,
      stock: stock
    });
  };

  const handleSellStock = (stock) => {
    // Check if we're in action card mode (spread rumor)
    if (selectedActionCard && selectedActionCard.actionType === "manipulate" && actionMode === "selecting_stock_down") {
      executeActionCard(selectedActionCard, stock, "down");
      return;
    }
    
    // Normal sell logic - only proceed if we're not in action mode
    if (!selectedActionCard) {
      socket.current.emit("sell_stock", {
        room: room,
        playerName: name,
        stock: stock
      });
    }
  };

  const handleDrawActionCard = () => {
    const myActions = actionsRemaining[name] || 0;
    if (!myTurn || myActions <= 0) {
      showMessage("❌ You need actions remaining to draw a card");
      return;
    }
    
    if (playerActionCards.length >= 4) {
      showMessage("❌ Your hand is full! You can only hold 4 action cards.");
      return;
    }
    
    socket.current.emit("draw_action_card", {
      room: room,
      playerName: name
    });
  };

  return (
    <div className="game">
      {/* Two Column Layout: Events (left) and Indexes + Stocks (right) */}
      <div className="events-indexes-layout">
        <EventsColumn
          activeEvents={activeEvents}
          styleCardSize={styleCardSize}
          onDrawActionCard={handleDrawActionCard}
          canDrawActionCard={myTurn && (actionsRemaining[name] || 0) > 0}
          handFull={playerActionCards.length >= 4}
        />

        <StocksColumn
          indexes={indexes}
          styleCardSize={styleCardSize}
          activeEvents={activeEvents}
          visualEffects={visualEffects}
          stocks={stocks}
          playerPortfolios={playerPortfolios}
          playerName={name}
          onPurchaseStock={handlePurchaseStock}
          onSellStock={handleSellStock}
          myTurn={myTurn}
          actionsRemaining={actionsRemaining}
          actionMode={actionMode}
          selectedActionCard={selectedActionCard}
          stockOwnershipCounts={stockOwnershipCounts}
          stockOwnershipByPlayer={stockOwnershipByPlayer}
          playerColors={playerColors}
          playerEmojis={playerEmojis}
        />
      </div>
  
      <MessageOverlay
        snackbars={snackbars}
        handleSnackbarClose={handleSnackbarClose}
      />

      <PlayerHandOverlay
        playerActionCards={playerActionCards}
        onSelectActionCard={handleSelectActionCard}
        canPlayActionCard={myTurn && (actionsRemaining[name] || 0) > 0}
        selectedActionCard={selectedActionCard}
      />

      {/* Game Header */}
      <GameHeader
        roundNumber={roundNumber}
        players={players}
        currentTurn={currentTurn}
        name={name}
        playerCash={playerCash}
        playerNetWorths={playerNetWorths}
        playerColors={playerColors}
        playerEmojis={playerEmojis}
        updates={updates}
        gameLog={gameLog}
        logExpanded={logExpanded}
        setLogExpanded={setLogExpanded}
        actionsRemaining={actionsRemaining}
        myTurn={myTurn}
        endTurnHandler={endTurnHandler}
        endGame={endGame}
      />
    </div>
  );
};

export default Game;
