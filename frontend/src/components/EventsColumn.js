import React from "react";
import EventCardView from "./EventCardView";
import DrawCardDeck from "./DrawCardDeck";

/**
 * EventsColumn
 * Renders currently active events and the draw-action-card deck stack.
 */
const EventsColumn = ({
  activeEvents = [],
  styleCardSize,
  onDrawActionCard,
  canDrawActionCard,
  handFull
}) => {
  return (
    <div className="events-column">
      {activeEvents.length > 0 && (
        <div className="events-left-aligned">
          {activeEvents.map((event, index) => (
            <div key={`event-${index}`} style={{ flex: "0 0 auto" }}>
              <EventCardView event={event} styleCardSize={styleCardSize} />
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          marginTop: "20px",
          paddingLeft: "10px"
        }}
      >
        <DrawCardDeck
          onDraw={onDrawActionCard}
          canDraw={canDrawActionCard}
          handFull={handFull}
          styleCardSize={styleCardSize}
        />
      </div>
    </div>
  );
};

export default EventsColumn;


