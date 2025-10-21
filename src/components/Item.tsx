import React from "react";
import { useDraggable } from "@dnd-kit/core";
import type { Position } from "./WarehouseLayout";

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
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id,
  });

  const handleClick = (e: React.MouseEvent) => {
    // Solo permitir click si no se está arrastrando
    if (!isDragging && onClick) {
      e.stopPropagation();
      onClick();
    }
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
      {...listeners}
      {...attributes}
      onClick={handleClick}
      className={`
        ${position.color || "bg-blue-500"} 
        ${isDragging ? "opacity-50" : "opacity-100"}
        border-2 border-gray-700 rounded shadow-lg 
        flex items-center justify-center 
        text-white font-bold 
        cursor-grab active:cursor-grabbing
        hover:shadow-xl transition-shadow duration-200
        select-none
      `}
    >
      <span className="text-sm">{position.label}</span>
    </div>
  );
};
