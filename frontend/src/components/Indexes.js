import React from "react";
import IndexCardView from "./IndexCardView";

const Indexes = ({ indexes = [], styleCardSize, styles = {}, activeEvents = [], visualEffects = [] }) => {
  return (
    <div className="indexes">
      <div className="indexes-header">📊 Market Indexes</div>
      <div className="share-cards" style={styles.cards}>
        {Array.from({ length: 4 }).map((_, i) => (
          <IndexCardView key={i} ix={indexes[i]} styleCardSize={styleCardSize} activeEvents={activeEvents} visualEffects={visualEffects} />
        ))}
      </div>
    </div>
  );
};

export default Indexes;
