import React, { useEffect, useState } from "react";
import { Item } from "./Item";
import { ItemModal } from "./ItemModal";
import type { Position } from "../data/Locations";
import {
  loadLocationsWithComparison,
  sampleLocations,
  GAP_X,
} from "../data/Locations";

interface WarehouseLayoutProps {
  width?: number;
  height?: number;
}

export const WarehouseLayout: React.FC<WarehouseLayoutProps> = ({
  width = 1600,
  height = 1200,
}) => {
  const [items, setItems] = useState<Position[]>(sampleLocations);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Position | null>(null);
  const [showingEnd, setShowingEnd] = useState(false);
  const [loading, setLoading] = useState(false);

  // Cargar datos iniciales con comparación desde el principio
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        console.log("🔄 Cargando estado inicial con comparación...");
        const data = await loadLocationsWithComparison(
          "/Locations_init.txt",
          "/Locations_end.txt",
          false // Mostrar materiales de init, pero marcar las que cambian
        );
        if (mounted && data.length) {
          console.log(
            `✅ Cargadas ${data.length} posiciones con comparación desde Locations_init.txt`
          );
          setItems(data);
        } else {
          console.log("⚠️ Locations_init.txt vacío, usando datos de muestra");
        }
      } catch (err) {
        console.error("❌ No se pudo cargar /Locations_init.txt:", err);
        console.log("📦 Usando datos de muestra (sampleLocations)");
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleToggleView = async () => {
    setLoading(true);
    try {
      // Cargar con comparación siempre, pero cambiar qué materiales mostrar
      console.log(
        `🔄 Cambiando a vista ${showingEnd ? "inicial" : "final"}...`
      );
      const data = await loadLocationsWithComparison(
        "/Locations_init.txt",
        "/Locations_end.txt",
        !showingEnd // Si estamos en init (showingEnd=false), cambiar a end (true)
      );
      setItems(data);
      setShowingEnd(!showingEnd);
    } catch (err) {
      console.error("❌ Error al cambiar vista:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (item: Position) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedItem(null);
  };

  // Extraer pasillos únicos para etiquetas
  const aisles = Array.from(
    new Set(items.map((item) => item.id.split("-")[0]))
  ).sort((a, b) => parseInt(a) - parseInt(b));

  return (
    <div className="flex flex-col items-center p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        Layout de Almacén Leiria
      </h1>

      {/* Botón para alternar entre init y end */}
      <button
        onClick={handleToggleView}
        disabled={loading}
        style={{
          color: "#000000",
          backgroundColor: showingEnd ? "#fbbf24" : "#3b82f6",
        }}
        className={`mb-6 px-6 py-3 rounded-lg font-semibold text-white shadow-lg transition-all ${
          loading ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
        }`}
      >
        {loading
          ? "⏳ Cargando..."
          : showingEnd
          ? "🔄 Ver Estado Inicial"
          : "🔄 Ver Estado Final"}
      </button>

      {showingEnd && (
        <p style={{ color: "#000000" }} className="text-sm text-gray-700 mb-4">
          Las posiciones en{" "}
          <span className="font-bold" style={{ color: "#f59e0b" }}>
            amarillo
          </span>{" "}
          han sido modificadas
        </p>
      )}

      <div className="bg-white rounded-lg shadow-lg overflow-auto">
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
          <div className="relative bg-gray-50" style={{ width, height }}>
            {/* Items del almacén */}
            {items.map((item) => (
              <Item
                key={item.id}
                position={item}
                onClick={() => handleItemClick(item)}
              />
            ))}
          </div>
        </div>
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
