import React, { useEffect, useState } from "react";
import { DndContext } from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { Item } from "./Item";
import { DroppableArea } from "./DroppableArea";
import { ItemModal } from "./ItemModal";
import type { Position } from "../data/Locations";
import { loadLocations, sampleLocations, GAP_X } from "../data/Locations";

interface WarehouseLayoutProps {
  width?: number;
  height?: number;
  gridSize?: number;
}

export const WarehouseLayout: React.FC<WarehouseLayoutProps> = ({
  width = 1200,
  height = 1000,
  gridSize = 20,
}) => {
  const [items, setItems] = useState<Position[]>(sampleLocations);

  const [activeId, setActiveId] = useState<string | null>(null);
  // Ya no guardamos offset de arrastre porque no usamos DragOverlay
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Position | null>(null);

  // Cargar datos reales desde /public/Location.txt si está disponible
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        console.log("🔄 Intentando cargar /Location.txt...");
        const data = await loadLocations("/Location.txt", {
          includeHeightZero: false,
        });
        if (mounted && data.length) {
          console.log(
            `✅ Cargadas ${data.length} posiciones desde Location.txt`
          );
          setItems(data);
        } else {
          console.log("⚠️ Location.txt vacío, usando datos de muestra");
        }
      } catch (err) {
        console.error("❌ No se pudo cargar /Location.txt:", err);
        console.log("📦 Usando datos de muestra (sampleLocations)");
        // Si no existe el fichero en public, nos quedamos con sampleLocations
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

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
  };

  // activeItem and dragOffset no se usan porque eliminamos el DragOverlay

  // Extraer pasillos únicos para etiquetas
  const aisles = Array.from(
    new Set(items.map((item) => item.id.split("-")[0]))
  ).sort((a, b) => parseInt(a) - parseInt(b));

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
        Layout de Almacén ({items.length} posiciones)
      </h1>

      <div className="bg-white rounded-lg shadow-lg overflow-auto">
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex flex-col">
            {/* Header superior con etiquetas de pasillo (columnas) */}
            <div className="flex bg-gray-100 border-b-2 border-gray-300">
              <div className="w-6 border-r-2 border-gray-300 flex items-center justify-center font-bold text-xs text-gray-700 writing-mode-vertical">
                P
              </div>
              {aisles.map((aisle) => {
                // Encontrar el primer item de este pasillo para calcular su posición X
                const firstItem = items.find((item) =>
                  item.id.startsWith(aisle + "-")
                );
                if (!firstItem) return null;
                return (
                  <div
                    key={aisle}
                    className="flex items-center justify-center py-2 text-xs font-semibold text-gray-700 bg-gray-50 border-r border-gray-200"
                    style={{
                      width: `${firstItem.width + GAP_X}px`,
                      minWidth: `${firstItem.width}px`,
                    }}
                  >
                    {aisle}
                  </div>
                );
              })}
            </div>

            {/* Canvas principal */}
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
          </div>

          {/* DragOverlay eliminado para evitar 'sombra' del elemento al arrastrar */}
        </DndContext>
      </div>

      {/* Panel de información eliminado temporalmente */}

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
