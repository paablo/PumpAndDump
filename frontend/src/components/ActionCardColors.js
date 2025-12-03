/**
 * Shared color scheme for action cards and action deck
 * Uses vibrant orange-red/amber theme to reflect "action" - distinct from events (pink) and indexes (blue/green/orange/purple)
 * Update this file to change styling for both components
 */

export const getActionCardColors = (actionType = "default") => {
  switch(actionType) {
    case "forecast":
      // Vibrant orange-red with lighter tint
      return {
        bg: "linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(255, 247, 237, 0.98)), linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(234, 88, 12, 0.05) 100%)",
        border: "#f97316",
        header: "linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(234, 88, 12, 0.1))",
        emoji: "🔮",
        name: "orange-red"
      };
    case "shuffle":
      // Medium orange-red
      return {
        bg: "linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(255, 245, 235, 0.98)), linear-gradient(135deg, rgba(251, 146, 60, 0.08) 0%, rgba(249, 115, 22, 0.05) 100%)",
        border: "#fb923c",
        header: "linear-gradient(135deg, rgba(251, 146, 60, 0.15), rgba(249, 115, 22, 0.1))",
        emoji: "🔀",
        name: "medium-orange"
      };
    case "insider_trading":
      // Deeper orange-red
      return {
        bg: "linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(255, 241, 230, 0.98)), linear-gradient(135deg, rgba(234, 88, 12, 0.08) 0%, rgba(194, 65, 12, 0.05) 100%)",
        border: "#ea580c",
        header: "linear-gradient(135deg, rgba(234, 88, 12, 0.15), rgba(194, 65, 12, 0.1))",
        emoji: "🤫",
        name: "deep-orange"
      };
    case "manipulate":
      // Red-orange with warm tone (distinct from industrial index orange)
      return {
        bg: "linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(255, 243, 224, 0.98)), linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(220, 38, 38, 0.05) 100%)",
        border: "#ef4444",
        header: "linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1))",
        emoji: "📊",
        name: "red-orange"
      };
    // Add new action types here
    default:
      // Primary action color - vibrant orange-red for action deck
      return {
        bg: "linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(255, 247, 237, 0.98)), linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(234, 88, 12, 0.05) 100%)",
        border: "#f97316",
        header: "linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(234, 88, 12, 0.1))",
        emoji: "🎴",
        name: "action-orange"
      };
  }
};

