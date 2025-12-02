import React from "react";

const fmtPrice = (p) =>
  typeof p === "number" ? `💲 ${Math.round(p).toLocaleString()}` : p ?? "-";

// Subtle color scheme for each index - just hints and accents
const getIndexColors = (indexName = "") => {
  const name = indexName.toLowerCase();
  
  if (name === "tech") {
    return {
      bg: "linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(240, 245, 255, 0.95)), linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(37, 99, 235, 0.05) 100%)",
      border: "#3b82f6",
      header: "linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(37, 99, 235, 0.08))",
      headerBorder: "rgba(59, 130, 246, 0.3)"
    };
  }
  
  if (name === "finance") {
    return {
      bg: "linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(240, 253, 244, 0.95)), linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(22, 163, 74, 0.05) 100%)",
      border: "#22c55e",
      header: "linear-gradient(135deg, rgba(34, 197, 94, 0.12), rgba(22, 163, 74, 0.08))",
      headerBorder: "rgba(34, 197, 94, 0.3)"
    };
  }
  
  if (name === "industrial") {
    return {
      bg: "linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(255, 251, 235, 0.95)), linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(217, 119, 6, 0.05) 100%)",
      border: "#f59e0b",
      header: "linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(217, 119, 6, 0.08))",
      headerBorder: "rgba(245, 158, 11, 0.3)"
    };
  }
  
  if (name === "health and science") {
    return {
      bg: "linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(250, 245, 255, 0.95)), linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(147, 51, 234, 0.05) 100%)",
      border: "#a855f7",
      header: "linear-gradient(135deg, rgba(168, 85, 247, 0.12), rgba(147, 51, 234, 0.08))",
      headerBorder: "rgba(168, 85, 247, 0.3)"
    };
  }
  
  // Default colors (if index name doesn't match)
  return {
    bg: "linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(240, 240, 240, 0.95)), linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
    border: "#2c2c2c",
    header: "linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.15))",
    headerBorder: "rgba(102, 126, 234, 0.3)"
  };
};

const IndexCardView = ({ ix, styleCardSize, activeEvents = [], visualEffects = [] }) => {
  // Use emoji from backend if available, fallback to default chart emoji
  const emoji = ix?.emoji || "📈";
  
  // Make index cards slightly smaller than stock cards (85% of stock card size)
  const indexCardSize = {
    width: styleCardSize.width ? `calc(${styleCardSize.width} * 0.85)` : "170px",
    height: styleCardSize.height ? `calc(${styleCardSize.height} * 0.85)` : "238px"
  };
  
  // Get colors for this index
  const colors = getIndexColors(ix?.name);
  
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
    <div className="stock-card card" style={{
      ...indexCardSize,
      background: colors.bg,
      borderColor: colors.border
    }}>
      {ix ? (
        <>
          <div className="stock-card-top" title={ix.name} style={{
            background: colors.header,
            borderBottom: `2px solid ${colors.headerBorder}`
          }}>
            {ix.name.toUpperCase()}
          </div>
          <div className="stock-card-spacer" style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            fontSize: "3.5rem"
          }}>
            {emoji}
          </div>
          <div className="stock-card-bottom" style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}>
            <div style={{ fontSize: "1.3rem", fontWeight: 900, whiteSpace: "nowrap" }}>
              {formatPriceWithIndicator()}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default IndexCardView;