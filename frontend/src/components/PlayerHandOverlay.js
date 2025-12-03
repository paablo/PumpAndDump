import React from "react";
import ActionCardView from "./ActionCardView";

/**
 * PlayerHandOverlay
 * Fixed overlay that displays the player's action cards.
 */
const PlayerHandOverlay = ({
  playerActionCards = [],
  onSelectActionCard,
  canPlayActionCard,
  selectedActionCard
}) => {
  const containerStyles = {
    display: "flex",
    gap: "12px",
    padding: "12px 15px",
    paddingTop: "40px",
    justifyContent: "center",
    flexWrap: "wrap",
    background:
      "linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(240, 248, 255, 0.05) 100%)",
    borderRadius: "12px",
    border: "3px solid rgba(59, 130, 246, 0.5)",
    boxShadow:
      "0 -4px 20px rgba(0, 0, 0, 0.05), 0 2px 8px rgba(59, 130, 246, 0.2)",
    backdropFilter: "blur(5px)",
    position: "relative"
  };

  const emptyStateStyles = {
    ...containerStyles,
    border: "3px dashed rgba(59, 130, 246, 0.5)",
    background:
      "linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(240, 248, 255, 0.03) 100%)",
    boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.03)"
  };

  const renderHandLabel = () => (
    <div
      style={{
        position: "absolute",
        top: "8px",
        left: "15px",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 10px",
        background: "rgba(0, 0, 0, 0.6)",
        borderRadius: "6px",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(255, 255, 255, 0.2)"
      }}
    >
      <span style={{ fontSize: "0.9rem" }}>🃏</span>
      <span
        style={{
          fontSize: "0.75rem",
          fontWeight: "700",
          color: "#fff",
          textTransform: "uppercase",
          letterSpacing: "1px",
          textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)"
        }}
      >
        Your Hand
      </span>
    </div>
  );

  return (
    <div
      style={{
        position: "fixed",
        bottom: "400px",
        left: 0,
        right: 0,
        zIndex: 99,
        padding: "15px 20px",
        pointerEvents: "none"
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          pointerEvents: "auto"
        }}
      >
        {playerActionCards.length > 0 ? (
          <div style={containerStyles}>
            {renderHandLabel()}
            {playerActionCards.map((actionCard, idx) => (
              <ActionCardView
                key={actionCard.id || idx}
                action={actionCard}
                styleCardSize={{ width: "200px", height: "270px" }}
                onSelect={onSelectActionCard}
                canPlay={canPlayActionCard}
                isSelected={selectedActionCard?.id === actionCard.id}
              />
            ))}
          </div>
        ) : (
          <div style={emptyStateStyles}>
            {renderHandLabel()}
            <span
              style={{
                color: "#999",
                fontSize: "0.9rem",
                fontStyle: "italic",
                padding: "20px"
              }}
            >
              No action cards in hand
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerHandOverlay;


