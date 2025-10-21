import React from "react";
import { useDroppable } from "@dnd-kit/core";

interface DroppableAreaProps {
  id: string;
  width: number;
  height: number;
  children: React.ReactNode;
}

export const DroppableArea: React.FC<DroppableAreaProps> = ({
  id,
  width,
  height,
  children,
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        relative
        ${isOver ? "bg-blue-50" : "bg-transparent"}
        transition-colors duration-200
      `}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        position: "absolute",
        top: 0,
        left: 0,
      }}
    >
      {children}
    </div>
  );
};
