import React from "react";

const fmtPrice = (p) =>
  typeof p === "number" ? `💲 ${Math.round(p).toLocaleString()}` : p ?? "-";

const IndexCardView = ({ ix, styleCardSize, activeEvents = [], visualEffects = [] }) => {
  // Use emoji from backend if available, fallback to default chart emoji
  const emoji = ix?.emoji || "📈";
  
  // Calculate net effect from visual effects (includes active events + recent bubble pops)
  // This shows the combined effect of bubble pops and new events in the same round
  let netEffect = 0;
  if (ix && visualEffects.length > 0) {
    visualEffects.forEach(effect => {
      if (effect.indexName === ix.name) {
        netEffect += effect.priceChange || 0;
      }
    });
  }
  
  // Format price with indicator on same line
  const formatPriceWithIndicator = () => {
    const priceText = fmtPrice(ix.price);
    
    if (netEffect > 0) {
      return (
        <>
          {priceText}
          <span style={{ 
            color: "#66bb66", 
            fontSize: "0.9rem", 
            marginLeft: "0.5rem"
          }}>
            ▲<span style={{ fontSize: "0.7rem" }}> +{netEffect}</span>
          </span>
        </>
      );
    } else if (netEffect < 0) {
      return (
        <>
          {priceText}
          <span style={{ 
            color: "#cc6666", 
            fontSize: "0.9rem", 
            marginLeft: "0.5rem"
          }}>
            ▼<span style={{ fontSize: "0.7rem" }}> {netEffect}</span>
          </span>
        </>
      );
    }
    
    return priceText;
  };
  
  return (
    <div className="stock-card card" style={styleCardSize}>
      {ix ? (
        <>
          <div className="stock-card-top" title={ix.name}>
            {ix.name.toUpperCase()}
          </div>
          <div className="stock-card-spacer" style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            fontSize: "4rem"
          }}>
            {emoji}
          </div>
          <div className="stock-card-bottom" style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 900, whiteSpace: "nowrap" }}>
              {formatPriceWithIndicator()}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default IndexCardView;
