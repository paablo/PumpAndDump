import React from "react";

/**
 * StyledSection
 * Reusable component that provides a styled container similar to "Your Hand"
 * Can be used for indexes, stocks, or any other card sections
 */
const StyledSection = ({
  title,
  icon = "📊",
  children,
  emptyMessage = "No items to display",
  isEmpty = false,
  containerStyle = {}
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
    position: "relative",
    ...containerStyle
  };

  const emptyStateStyles = {
    ...containerStyles,
    border: "3px dashed rgba(59, 130, 246, 0.5)",
    background:
      "linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(240, 248, 255, 0.03) 100%)",
    boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.03)"
  };

  const renderLabel = () => (
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
      <span style={{ fontSize: "0.9rem" }}>{icon}</span>
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
        {title}
      </span>
    </div>
  );

  return (
    <div style={isEmpty ? emptyStateStyles : containerStyles}>
      {renderLabel()}
      {isEmpty ? (
        <span
          style={{
            color: "#999",
            fontSize: "0.9rem",
            fontStyle: "italic",
            padding: "20px"
          }}
        >
          {emptyMessage}
        </span>
      ) : (
        children
      )}
    </div>
  );
};

export default StyledSection;

