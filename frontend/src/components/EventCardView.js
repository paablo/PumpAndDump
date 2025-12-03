import React from "react";

const EventCardView = ({ event, styleCardSize }) => {
  // Event cards should be slightly larger than index cards
  const eventCardSize = {
    width: "260px",
    height: "350px"
  };

  // Calculate initial effects text
  let initialEffects = "No effects";
  if (Array.isArray(event.effects) && event.effects.length > 0) {
    initialEffects = event.effects
      .map((eff) => {
        const sign = eff.priceChange >= 0 ? "+" : "";
        return `${eff.indexName} ${sign}${eff.priceChange}`;
      })
      .join(", ");
  }

  // Calculate conditional effects text
  let conditionalInfo = "";
  if (event.conditionalEffects && Array.isArray(event.conditionalEffects.effects)) {
    const condEffects = event.conditionalEffects.effects
      .map((eff) => {
        const sign = eff.priceChange >= 0 ? "+" : "";
        return `${eff.indexName} ${sign}${eff.priceChange}`;
      })
      .join(", ");

    let probability = "";
    if (event.conditionalEffects.probability !== null && event.conditionalEffects.probability !== undefined) {
      probability = `${Math.round(event.conditionalEffects.probability * 100)}%`;
    } else if (event.conditionalEffects.dieRoll) {
      const dr = event.conditionalEffects.dieRoll;
      const total = dr.max - dr.min + 1;
      const successCount = dr.success.length;
      probability = `${Math.round((successCount / total) * 100)}%`;
    }

    const timingText = event.conditionalEffects.timing === "end" 
      ? "End of round" 
      : "Next round";
    
    conditionalInfo = `⚠️ ${timingText}, ${probability} bubble pop: ${condEffects}`;
  }

  const isOngoingBubble = event.conditionalEffects && event.conditionalEffects.timing === "end";

  return (
    <div className="stock-card card" style={{
      ...eventCardSize,
      background: "linear-gradient(145deg, rgba(255, 250, 240, 0.98), rgba(255, 245, 230, 0.98)), linear-gradient(135deg, rgba(236, 72, 153, 0.08) 0%, rgba(219, 39, 119, 0.05) 100%)",
      borderColor: "#db2777",
      borderWidth: "3px",
      position: "relative",
      overflow: "hidden",
      boxShadow: "0 8px 20px rgba(219, 39, 119, 0.25), 0 2px 8px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.7)",
      animation: "eventCardPulse 3s ease-in-out infinite"
    }}>
      {/* Add CSS animation keyframes */}
      <style>
        {`
          @keyframes eventCardPulse {
            0%, 100% {
              box-shadow: 0 8px 20px rgba(219, 39, 119, 0.25), 0 2px 8px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.7);
            }
            50% {
              box-shadow: 0 8px 24px rgba(219, 39, 119, 0.35), 0 2px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.8);
            }
          }
          
          @keyframes shimmer {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }
        `}
      </style>

      {/* Animated shimmer effect */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)",
        animation: "shimmer 4s ease-in-out infinite",
        pointerEvents: "none"
      }} />
      
      {/* Decorative corner accent with glow */}
      <div style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: "60px",
        height: "60px",
        background: "linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(219, 39, 119, 0.15) 100%)",
        clipPath: "polygon(100% 0, 0 0, 100% 100%)",
        pointerEvents: "none",
        boxShadow: "-2px 2px 8px rgba(219, 39, 119, 0.2)"
      }} />
      
      {/* Small decorative dots pattern */}
      <div style={{
        position: "absolute",
        top: "8px",
        left: "8px",
        width: "4px",
        height: "4px",
        borderRadius: "50%",
        background: "rgba(219, 39, 119, 0.3)",
        boxShadow: "8px 0 0 rgba(219, 39, 119, 0.3), 16px 0 0 rgba(219, 39, 119, 0.3)",
        pointerEvents: "none"
      }} />
      
      {/* "Breaking News" Badge with enhanced styling */}
      <div className="stock-card-top" style={{
        background: "linear-gradient(135deg, rgba(236, 72, 153, 0.18), rgba(219, 39, 119, 0.12))",
        borderBottom: "2px solid rgba(219, 39, 119, 0.4)",
        position: "relative",
        paddingLeft: "8px",
        boxShadow: "0 2px 4px rgba(219, 39, 119, 0.1)"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px"
        }}>
          <span style={{ 
            fontSize: "1.1rem",
            filter: "drop-shadow(0 1px 2px rgba(219, 39, 119, 0.3))"
          }}>📰</span>
          <span style={{ 
            flex: 1, 
            textAlign: "center",
            textShadow: "0 1px 2px rgba(255, 255, 255, 0.8)"
          }}>
            {event.name || "Unknown Event"}
          </span>
        </div>
        {/* Decorative underline with gradient */}
        <div style={{
          position: "absolute",
          bottom: "-2px",
          left: "10%",
          right: "10%",
          height: "2px",
          background: "linear-gradient(90deg, transparent, rgba(219, 39, 119, 0.4) 50%, transparent)"
        }} />
      </div>
      
      {/* Event Content */}
      <div className="stock-card-spacer" style={{ 
        display: "flex", 
        flexDirection: "column",
        justifyContent: "center",
        padding: "10px",
        gap: "10px",
        position: "relative",
        zIndex: 1
      }}>
        {/* Description with enhanced newspaper style */}
        {event.description && (
          <div style={{
            fontSize: "0.8rem",
            lineHeight: "1.35",
            color: "#444",
            textAlign: "center",
            fontStyle: "italic",
            padding: "8px 10px",
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(255, 250, 245, 0.8))",
            borderRadius: "6px",
            borderLeft: "3px solid rgba(219, 39, 119, 0.5)",
            borderRight: "3px solid rgba(219, 39, 119, 0.5)",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.5)"
          }}>
            <span style={{ 
              fontSize: "1.2em", 
              lineHeight: "0",
              color: "rgba(219, 39, 119, 0.6)"
            }}>"</span>
            {event.description}
            <span style={{ 
              fontSize: "1.2em", 
              lineHeight: "0",
              color: "rgba(219, 39, 119, 0.6)"
            }}>"</span>
          </div>
        )}
        
        {/* Market Impact Section with badge */}
        <div style={{
          background: "rgba(255, 255, 255, 0.6)",
          borderRadius: "8px",
          padding: "6px",
          border: "1px dashed rgba(219, 39, 119, 0.3)",
          boxShadow: "0 2px 6px rgba(219, 39, 119, 0.1)"
        }}>
          <div style={{
            fontSize: "0.7rem",
            fontWeight: "700",
            color: "#db2777",
            textAlign: "center",
            textTransform: "uppercase",
            letterSpacing: "0.8px",
            marginBottom: "6px",
            background: "linear-gradient(90deg, rgba(236, 72, 153, 0.15), rgba(219, 39, 119, 0.2), rgba(236, 72, 153, 0.15))",
            padding: "3px 8px",
            borderRadius: "4px",
            display: "inline-block",
            width: "calc(100% - 16px)",
            margin: "0 8px 6px 8px",
            boxShadow: "0 1px 3px rgba(219, 39, 119, 0.2)"
          }}>
            ⚡ Market Impact ⚡
          </div>
          
          {/* Initial Effects */}
          <div style={{
            fontSize: "0.85rem",
            fontWeight: "600",
            color: "#2d3748",
            textAlign: "center",
            padding: "8px",
            background: "linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(219, 39, 119, 0.1))",
            borderRadius: "6px",
            border: "2px solid rgba(219, 39, 119, 0.3)",
            boxShadow: "0 2px 4px rgba(219, 39, 119, 0.12)"
          }}>
            📊 {initialEffects}
            {isOngoingBubble && (
              <div style={{ 
                fontSize: '0.7rem', 
                opacity: 0.9, 
                marginTop: '4px',
                fontWeight: '600',
                color: "#db2777",
                textShadow: "0 1px 1px rgba(255, 255, 255, 0.5)"
              }}>
                ♻️ (ongoing each round)
              </div>
            )}
          </div>
        </div>
        
        {/* Conditional Effects - Enhanced Warning Style */}
        {conditionalInfo && (
          <div style={{
            fontSize: "0.75rem",
            color: "#92400e",
            textAlign: "center",
            padding: "8px",
            background: "linear-gradient(135deg, rgba(251, 191, 36, 0.25), rgba(245, 158, 11, 0.2))",
            borderRadius: "6px",
            border: "2px solid rgba(245, 158, 11, 0.5)",
            fontWeight: "600",
            lineHeight: "1.3",
            boxShadow: "0 2px 6px rgba(245, 158, 11, 0.25), inset 0 1px 2px rgba(255, 255, 255, 0.3)"
          }}>
            {conditionalInfo}
          </div>
        )}
      </div>
      
      {/* Enhanced decorative bottom accent */}
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "4px",
        background: "linear-gradient(90deg, transparent, rgba(219, 39, 119, 0.4) 25%, rgba(219, 39, 119, 0.6) 50%, rgba(219, 39, 119, 0.4) 75%, transparent)",
        boxShadow: "0 -1px 3px rgba(219, 39, 119, 0.2)"
      }} />
    </div>
  );
};

export default EventCardView;