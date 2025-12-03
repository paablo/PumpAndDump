import React from "react";
import IndexCardView from "./IndexCardView";

const EventsAndIndexes = ({ 
  indexes, 
  styleCardSize, 
  activeEvents,
  visualEffects 
}) => {
  return (
    <div className="indexes-centered">
      {/* Index Cards - Centered */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={`index-${i}`} style={{ flex: '0 0 auto' }}>
          <IndexCardView 
            ix={indexes[i]} 
            styleCardSize={styleCardSize} 
            activeEvents={activeEvents} 
            visualEffects={visualEffects} 
          />
        </div>
      ))}
    </div>
  );
};

export default EventsAndIndexes;