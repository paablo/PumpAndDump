import React from "react";

const CardView = ({ card, id, onClick, className = "card playingCard", styleCardSize = {} }) => {
  const style = card
    ? { backgroundPosition: card.backgroundPosition, ...styleCardSize }
    : { ...styleCardSize };
  return (
    <div id={id} className={className} onClick={onClick} style={style}></div>
  );
};

export default CardView;
