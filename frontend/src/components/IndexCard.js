import React from "react";

const getIndexEmoji = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("manufacturing")) return "🏭";
  if (n.includes("finance") || n.includes("sp")) return "🏦";
  if (n.includes("tech")) return "💻";
  if (n.includes("health_science")) return "🧬";
  return "📈";
};

const fmtPrice = (p) =>
  typeof p === "number" ? `💲 ${Math.round(p).toLocaleString()}` : p ?? "-";


const IndexCard = ({ ix, styleCardSize }) => {
  return (
    <div className="stock-card card" style={styleCardSize}>
      {ix ? (
        <div >
          {/* parent wrapper to prevent name spilling; allow wrapping */}
          <div style={{ width: "100%", overflow: "hidden" }}>
            <div
              className="stock-card-top"
              style={{
                whiteSpace: "normal",
                overflowWrap: "break-word",
                wordBreak: "break-word",
              }}
              title={ix.name}
            >
              {ix.name.toUpperCase()}
            </div>
          </div>
          <div style={{ fontSize: "1.05rem", fontWeight: 700 }}>
            {fmtPrice(ix.price)}
          </div>
          <div style={{ marginTop: 8, fontSize: "2rem", lineHeight: 1 }}>
            {getIndexEmoji(ix.name)}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default IndexCard;
