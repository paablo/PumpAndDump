import React from "react";

const ActiveEvents = ({ activeEvents }) => {
  // Ensure activeEvents is an array
  if (!Array.isArray(activeEvents) || activeEvents.length === 0) {
    return null;
  }

  // Don't filter by status - backend manages which events should be active
  // Events are displayed until cleanupResolvedStartEvents() removes them at end of round

  return (
    <div className="active-events-section">
      <div className="events-header">🎪 Active Events</div>
      <div className="events-list">
        {activeEvents.map((event, index) => {
          // Calculate effect summary for display with safety checks
          // Show only static amount on event card
          let initialEffects = "No effects";
          if (Array.isArray(event.effects) && event.effects.length > 0) {
            initialEffects = event.effects
              .map((eff) => {
                const sign = eff.priceChange >= 0 ? "+" : "";
                return `${eff.indexName} ${sign}${eff.priceChange}`;
              })
              .join(", ");
          }

          let conditionalInfo = "";
          if (event.conditionalEffects && Array.isArray(event.conditionalEffects.effects)) {
            // Show only static pop amount on event card
            const condEffects = event.conditionalEffects.effects
              .map((eff) => {
                const sign = eff.priceChange >= 0 ? "+" : "";
                return `${eff.indexName} ${sign}${eff.priceChange}`;
              })
              .join(", ");

            let probability = "";
            if (event.conditionalEffects.probability !== null && event.conditionalEffects.probability !== undefined) {
              probability = `${Math.round(
                event.conditionalEffects.probability * 100
              )}%`;
            } else if (event.conditionalEffects.dieRoll) {
              const dr = event.conditionalEffects.dieRoll;
              const total = dr.max - dr.min + 1;
              const successCount = dr.success.length;
              probability = `${Math.round(
                (successCount / total) * 100
              )}%`;
            }

            // Make it more human-readable
            const timingText = event.conditionalEffects.timing === "end" 
              ? "At the end of this round" 
              : "At the start of next round";
            
            conditionalInfo = `⚠️ ${timingText}, ${probability} chance bubble pops: ${condEffects}`;
          }

          // Determine if this is an ongoing bubble (has conditional effects)
          const isOngoingBubble = event.conditionalEffects && event.conditionalEffects.timing === "end";

          return (
            <div key={index} className="event-card">
              <div className="event-name">{event.name || "Unknown Event"}</div>
              <div className="event-description">{event.description || ""}</div>
              <div className="event-effects">
                <div>
                  📊 {initialEffects}
                  {isOngoingBubble && (
                    <span style={{ fontSize: '0.85rem', opacity: 0.9, marginLeft: '6px' }}>
                      (each round)
                    </span>
                  )}
                </div>
                {conditionalInfo && (
                  <div style={{ marginTop: '8px', fontSize: '0.9rem', borderTop: '1px solid rgba(255, 255, 255, 0.3)', paddingTop: '8px' }}>
                    {conditionalInfo}
                  </div>
                )}
              </div>
              <div className="event-status">
                Status: {(event.status || "pending").toUpperCase()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActiveEvents;

