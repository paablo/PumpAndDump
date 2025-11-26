import React from "react";

const Updates = ({ updates, styles }) => {
  return (
    <div className="updates" style={styles.updates}>
      <h2>Updates</h2>
      <div className="list">
        <ul>
          {updates.map((update, index) => (
            <li key={index}>{update}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Updates;
