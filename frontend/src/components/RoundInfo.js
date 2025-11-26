import React from "react";

const RoundInfo = ({ roundNumber, styles }) => {
  return (
    <div className="round-info" style={styles.roundInfo}>
      <h2>Current Round: {roundNumber}</h2>
    </div>
  );
};

export default RoundInfo;
