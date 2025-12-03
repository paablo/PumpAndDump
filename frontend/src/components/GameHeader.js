import React from "react";
import GameLogBanner from "./GameLogBanner";
import RoundTracker from "./RoundTracker";
import PlayersWealth from "./PlayersWealth";
import GameActionButtons from "./GameActionButtons";

const GameHeader = ({
  roundNumber,
  players,
  currentTurn,
  name,
  playerCash,
  playerNetWorths = {},
  playerColors = {},
  playerEmojis = {},
  updates,
  gameLog,
  logExpanded,
  setLogExpanded,
  actionsRemaining = {},
  myTurn,
  endTurnHandler,
  endGame,
}) => {

  return (
    <div className="game-header">
      {/* Game Log & Market News */}
      <GameLogBanner
        updates={updates}
        gameLog={gameLog}
        logExpanded={logExpanded}
        setLogExpanded={setLogExpanded}
      />

      {/* Round Tracker */}
      <RoundTracker roundNumber={roundNumber} />

      {/* Game Info Bar */}
      <div className="game-info-bar" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        <PlayersWealth
          players={players}
          currentTurn={currentTurn}
          name={name}
          playerCash={playerCash}
          playerNetWorths={playerNetWorths}
          playerColors={playerColors}
          playerEmojis={playerEmojis}
          actionsRemaining={actionsRemaining}
        />

        <GameActionButtons
          myTurn={myTurn}
          onEndTurn={endTurnHandler}
          onEndGame={endGame}
        />
      </div>
    </div>
  );
};

export default GameHeader;

