import React, { useState } from "react";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { Item } from "./Item";
import { DroppableArea } from "./DroppableArea";
import { ItemModal } from "./ItemModal";

export interface Floor {
  level: number;
  product: string;
}

export interface Position {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  color?: string;
  floors: Floor[];
}

interface WarehouseLayoutProps {
  width?: number;
  height?: number;
  gridSize?: number;
}

export const WarehouseLayout: React.FC<WarehouseLayoutProps> = ({
  width = 800,
  height = 600,
  gridSize = 20,
}) => {
  const [items, setItems] = useState<Position[]>([
    {
      id: "1",
      x: 100,
      y: 100,
      width: 80,
      height: 60,
      label: "A1",
      color: "bg-blue-500",
      floors: [
        { level: 1, product: "Producto Alpha" },
        { level: 2, product: "Producto Beta" },
        { level: 3, product: "Producto Gamma" },
      ],
    },
    {
      id: "2",
      x: 200,
      y: 150,
      width: 100,
      height: 80,
      label: "B1",
      color: "bg-green-500",
      floors: [
        { level: 1, product: "Artículo X" },
        { level: 2, product: "Artículo Y" },
      ],
    },
    {
      id: "3",
      x: 350,
      y: 200,
      width: 120,
      height: 60,
      label: "C1",
      color: "bg-red-500",
      floors: [
        { level: 1, product: "Material Delta" },
        { level: 2, product: "Material Epsilon" },
        { level: 3, product: "Material Zeta" },
        { level: 4, product: "Material Eta" },
      ],
    },
  ]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Position | null>(null);

  const handleItemClick = (item: Position) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedItem(null);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);

    // Calcular el offset desde el punto de click hasta la esquina del elemento
    const item = items.find((item) => item.id === event.active.id);
    if (item && event.activatorEvent) {
      const rect = (
        event.activatorEvent.target as HTMLElement
      ).getBoundingClientRect();
      const activatorEvent = event.activatorEvent as MouseEvent;
      const clickX = activatorEvent.clientX;
      const clickY = activatorEvent.clientY;

      setDragOffset({
        x: clickX - rect.left,
        y: clickY - rect.top,
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;

    if (active) {
      setItems((items) =>
        items.map((item) => {
          if (item.id === active.id) {
            // Ajustar a la grilla
            const newX = Math.round((item.x + delta.x) / gridSize) * gridSize;
            const newY = Math.round((item.y + delta.y) / gridSize) * gridSize;

            // Asegurar que no salga de los límites
            const clampedX = Math.max(0, Math.min(newX, width - item.width));
            const clampedY = Math.max(0, Math.min(newY, height - item.height));

            return {
              ...item,
              x: clampedX,
              y: clampedY,
            };
          }
          return item;
        })
      );
    }

    setActiveId(null);
    setDragOffset({ x: 0, y: 0 });
  };

  const activeItem = items.find((item) => item.id === activeId);

  // Crear líneas de grilla
  const gridLines = [];
  // Líneas verticales
  for (let i = 0; i <= width; i += gridSize) {
    gridLines.push(
      <line
        key={`v-${i}`}
        x1={i}
        y1={0}
        x2={i}
        y2={height}
        stroke="#e5e7eb"
        strokeWidth="0.5"
        opacity="0.8"
      />
    );
  }
  // Líneas horizontales
  for (let i = 0; i <= height; i += gridSize) {
    gridLines.push(
      <line
        key={`h-${i}`}
        x1={0}
        y1={i}
        x2={width}
        y2={i}
        stroke="#e5e7eb"
        strokeWidth="0.5"
        opacity="0.8"
      />
    );
  }

  return (
    <div className="flex flex-col items-center p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Layout de Almacén
      </h1>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div
            className="relative border-2 border-gray-300 bg-white"
            style={{ width, height }}
          >
            {/* Grilla de fondo */}
            <svg
              className="absolute top-0 left-0 pointer-events-none"
              width={width}
              height={height}
              style={{
                width: `${width}px`,
                height: `${height}px`,
                position: "absolute",
                top: 0,
                left: 0,
              }}
            >
              {gridLines}
            </svg>

            {/* Área droppable */}
            <DroppableArea id="warehouse" width={width} height={height}>
              {/* Items del almacén */}
              {items.map((item) => (
                <Item
                  key={item.id}
                  id={item.id}
                  position={item}
                  isDragging={item.id === activeId}
                  onClick={() => handleItemClick(item)}
                />
              ))}
            </DroppableArea>
          </div>

          {/* Overlay para el item que se está arrastrando */}
          <DragOverlay>
            {activeItem ? (
              <div
                className={`${activeItem.color} bg-opacity-80 border-2 border-gray-700 rounded shadow-lg flex items-center justify-center text-white font-bold cursor-grabbing`}
                style={{
                  width: activeItem.width,
                  height: activeItem.height,
                  transform: `translate(-${dragOffset.x}px, -${dragOffset.y}px)`,
                }}
              >
                {activeItem.label}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Panel de información */}
      <div className="mt-6 bg-white p-4 rounded-lg shadow-lg w-full max-w-4xl">
        <h2 className="text-xl font-semibold mb-4">Posiciones Actuales</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="border p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-4 h-4 ${item.color} rounded`}></div>
                <span className="font-semibold">{item.label}</span>
              </div>
              <div className="text-sm text-gray-600">
                <p>
                  X: {item.x}px, Y: {item.y}px
                </p>
                <p>
                  Tamaño: {item.width} × {item.height}px
                </p>
                <p>Pisos ocupados: {item.floors.length}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de información del item */}
      {selectedItem && (
        <ItemModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          itemLabel={selectedItem.label}
          floors={selectedItem.floors}
        />
      )}
    </div>
  );
};
