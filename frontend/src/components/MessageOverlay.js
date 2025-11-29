import React from "react";
import { Snackbar } from "@material-ui/core";

const MessageOverlay = ({
  snackbar,
  handleSnackbarClose,
}) => {
  // Format message to support new lines
  const formatMessage = (message) => {
    if (!message) return null;
    
    // Split by newlines and render each line
    const lines = message.split('\n');
    
    return (
      <div className="snackbar-message" style={{ whiteSpace: 'pre-line', textAlign: 'left' }}>
        {lines.map((line, index) => (
          <div key={index} style={{ marginBottom: index < lines.length - 1 ? '0.5rem' : '0' }}>
            {line}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Blurred overlay while snackbar is open */}
      {snackbar.open && <div className="overlay" />}

      {/* Snackbar for modern non-blocking messages */}
      <Snackbar
        anchorOrigin={{ vertical: "center", horizontal: "center" }}
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={formatMessage(snackbar.message)}
        ContentProps={{ className: "snackbar-content" }}
        className="snackbar-fixed"
      />
    </>
  );
};

export default MessageOverlay;

