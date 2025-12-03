import React from "react";
import { Snackbar } from "@material-ui/core";

const MessageOverlay = ({
  snackbars = [],
  handleSnackbarClose,
}) => {
  // Format message to support new lines
  const formatMessage = (message) => {
    if (!message) return null;
    
    // Split by newlines and render each line
    const lines = message.split('\n');
    
    return (
      <div style={{ whiteSpace: 'pre-line', textAlign: 'left', flex: 1 }}>
        {lines.map((line, index) => (
          <div key={index} style={{ marginBottom: index < lines.length - 1 ? '0.5rem' : '0' }}>
            {line}
          </div>
        ))}
      </div>
    );
  };

  // Handle escape key press - closes the most recent (top) message
  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && snackbars.length > 0) {
        // Close the last snackbar (most recent)
        const lastSnackbar = snackbars[snackbars.length - 1];
        handleSnackbarClose(lastSnackbar.id);
      }
    };

    if (snackbars.length > 0) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [snackbars, handleSnackbarClose]);

  return (
    <>
      {/* Clickable blurred overlay while any snackbar is open */}
      {snackbars.length > 0 && (
        <div 
          className="overlay" 
          onClick={() => {
            // Close the most recent (top) message when clicking overlay
            const lastSnackbar = snackbars[snackbars.length - 1];
            handleSnackbarClose(lastSnackbar.id);
          }}
          style={{ cursor: 'pointer' }}
        />
      )}

      {/* Container for stacked snackbars */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1400,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px'
      }}>
      {[...snackbars].map((snackbar, index) => (
          <div
            key={snackbar.id}
            style={{
              pointerEvents: 'auto',
              animation: 'slideIn 0.3s ease-out',
              minWidth: '300px',
              maxWidth: '600px'
            }}
          >
            <div className="snackbar-content" style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              width: '100%',
              backgroundColor: '#323232',
              color: 'white',
              padding: '16px',
              paddingRight: '40px', // Make room for the X button
              borderRadius: '4px',
              boxShadow: '0px 3px 5px -1px rgba(0,0,0,0.2), 0px 6px 10px 0px rgba(0,0,0,0.14), 0px 1px 18px 0px rgba(0,0,0,0.12)'
            }}>
              {/* Close button - absolutely positioned in top-right corner */}
              <button
                onClick={() => handleSnackbarClose(snackbar.id)}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '20px',
                  padding: '4px',
                  opacity: 0.7,
                  transition: 'opacity 0.2s',
                  lineHeight: 1,
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                title="Close (Esc)"
              >
                ✕
              </button>
              
              {/* Message content */}
              <div style={{ width: '100%', fontSize: '1.2rem' }}>
                {formatMessage(snackbar.message)}
              </div>
              
            </div>
          </div>
        ))}
      </div>

      {/* Add CSS animation */}
      <style>
        {`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </>
  );
};

export default MessageOverlay;