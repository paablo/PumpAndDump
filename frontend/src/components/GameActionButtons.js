import React, { useState } from "react";
import { Button, Dialog, DialogTitle, DialogContent, IconButton } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import GameRules from "./GameRules";

/**
 * GameActionButtons
 * Displays help, end turn, and end game buttons, plus the game rules dialog
 */
const GameActionButtons = ({ myTurn, onEndTurn, onEndGame }) => {
  const [rulesOpen, setRulesOpen] = useState(false);

  return (
    <>
      <div style={{ 
        display: 'flex', 
        gap: '8px',
        flexShrink: 0
      }}>
        <Button
          variant="outlined"
          onClick={() => setRulesOpen(true)}
          style={{
            minWidth: '80px',
            color: '#2196F3',
            borderColor: '#2196F3'
          }}
          title="View Game Rules"
        >
          ❓ Help
        </Button>
        <Button
          variant="contained"
          color="primary"
          disabled={!myTurn}
          onClick={onEndTurn}
          style={{
            minWidth: '110px',
            fontWeight: 'bold',
            backgroundColor: myTurn ? '#4CAF50' : undefined,
            boxShadow: myTurn ? '0 4px 12px rgba(76, 175, 80, 0.4)' : undefined
          }}
        >
          End Turn
        </Button>
        <Button 
          variant="contained" 
          onClick={onEndGame}
          style={{
            minWidth: '110px',
            backgroundColor: '#f44336',
            color: 'white'
          }}
        >
          End Game
        </Button>
      </div>

      {/* Game Rules Dialog */}
      <Dialog
        open={rulesOpen}
        onClose={() => setRulesOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <DialogTitle style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '20px 24px',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
          flexShrink: 0,
          position: 'relative',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold', flex: 1 }}>📖 Game Rules</span>
          <IconButton
            onClick={() => setRulesOpen(false)}
            size="small"
            style={{ 
              color: '#666',
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              margin: 0,
              padding: '8px'
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent style={{ 
          padding: 0, 
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          flex: 1
        }}>
          <GameRules variant="popup" showTitle={false} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GameActionButtons;

