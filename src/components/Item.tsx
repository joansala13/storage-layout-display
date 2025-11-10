import React from "react";
import type { Position } from "../data/Locations";

interface ItemProps {
  position: Position;
  onClick?: () => void;
}

export const Item: React.FC<ItemProps> = ({ position, onClick }) => {
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) onClick();
  };

  const style = {
    position: "absolute" as const,
    left: position.x,
    top: position.y,
    width: position.width,
    height: position.height,
    backgroundColor: position.color || "#3b82f6", // amarillo si tiene color, azul por defecto
  };

  return (
    <div
      style={style}
      onDoubleClick={handleDoubleClick}
      className={`
        border border-gray-600 rounded
        flex items-center justify-center
        text-white font-semibold text-xs
        cursor-pointer
        hover:shadow-lg hover:border-gray-800 hover:scale-105 transition-all duration-200
        select-none
      `}
    >
      <span className="text-xs whitespace-nowrap">{position.label}</span>
    </div>
  );
};
