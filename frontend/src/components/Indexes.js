import React from "react";
import IndexCard from "./IndexCard";

const Indexes = ({ indexes = [], styleCardSize, styles = {} }) => {
  return (
    <div className="indexes">
      <h3>Indexes</h3>
      <div className="share-cards" style={styles.cards}>
        {Array.from({ length: 4 }).map((_, i) => (
          <IndexCard key={i} ix={indexes[i]} styleCardSize={styleCardSize} />
        ))}
      </div>
    </div>
  );
};

export default Indexes;
