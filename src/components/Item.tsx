import React from "react";
import { useDraggable } from "@dnd-kit/core";
import type { Position } from "../data/Locations";

interface ItemProps {
  id: string;
  position: Position;
  isDragging?: boolean;
  onClick?: () => void;
}

export const Item: React.FC<ItemProps> = ({
  id,
  position,
  isDragging = false,
  onClick,
}) => {
  const {
    attributes = {},
    listeners,
    setNodeRef,
    transform,
  } = useDraggable({
    id: id,
  });

  // No usamos click corto para abrir modal (para no interferir con drag).
  // Simplemente reenviamos los listeners que devuelve useDraggable.
  const mergedListeners: Record<string, unknown> = {
    ...(listeners || {}),
  };

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
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
    zIndex: isDragging ? 999 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...mergedListeners}
      {...attributes}
      onDoubleClick={handleDoubleClick}
      className={`
        ${position.color || "bg-blue-500"}
        ${isDragging ? "opacity-60" : "opacity-100"}
        border border-gray-600 rounded
        flex items-center justify-center
        text-white font-semibold text-xs
        cursor-grab active:cursor-grabbing
        hover:shadow-lg hover:border-gray-800 transition-all duration-200
        select-none
      `}
    >
      <span className="text-xs whitespace-nowrap">{position.label}</span>
    </div>
  );
};
