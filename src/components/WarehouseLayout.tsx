import React, { useEffect, useState } from "react";
import { Item } from "./Item";
import { ItemModal } from "./ItemModal";
import type { Position } from "../data/Locations";
import {
  loadLocationsWithMaterials,
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

  // Cargar datos reales desde /public/Location_updated_rule1.txt con materiales
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        console.log("🔄 Intentando cargar /Location_updated_rule1.txt...");
        const data = await loadLocationsWithMaterials(
          "/Location_updated_rule1.txt"
        );
        if (mounted && data.length) {
          console.log(
            `✅ Cargadas ${data.length} posiciones con materiales desde Location_updated_rule1.txt`
          );
          setItems(data);
        } else {
          console.log(
            "⚠️ Location_updated_rule1.txt vacío, usando datos de muestra"
          );
        }
      } catch (err) {
        console.error("❌ No se pudo cargar /Location_updated_rule1.txt:", err);
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

  // Extraer pasillos únicos para etiquetas
  const aisles = Array.from(
    new Set(items.map((item) => item.id.split("-")[0]))
  ).sort((a, b) => parseInt(a) - parseInt(b));

  return (
    <div className="flex flex-col items-center p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Layout de Almacén ({items.length} posiciones)
      </h1>

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
