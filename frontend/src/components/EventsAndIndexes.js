import React from "react";
import IndexCardView from "./IndexCardView";
import EventCardView from "./EventCardView";

const EventsAndIndexes = ({ 
  activeEvents, 
  indexes, 
  styleCardSize, 
  visualEffects 
}) => {


  return (
    <div className="events-and-indexes-combined">
     {activeEvents && activeEvents.length > 0 && activeEvents.map((event, index) => (
        <div key={`event-${index}`} style={{ flex: '0 0 auto' }}>
          <EventCardView 
            event={event}
            styleCardSize={styleCardSize}
          />
        </div>
      ))}

      {/* Index Cards */}
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