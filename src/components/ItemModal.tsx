import React, { useEffect, useRef, useCallback } from "react";

interface Floor {
  level: number;
  materials: string[];
}

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemLabel: string;
  floors: Floor[];
}

export const ItemModal: React.FC<ItemModalProps> = ({
  isOpen,
  onClose,
  itemLabel,
  floors,
}) => {
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKey);
      // Enfocar el modal al abrir
      requestAnimationFrame(() => dialogRef.current?.focus());
    }
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, handleKey]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Overlay oscuro para crear contraste con el modal blanco */}
      <div
        style={{ backgroundColor: "rgba(0, 0, 0, 0.85)" }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        tabIndex={-1}
        style={{ backgroundColor: "#ffffff" }}
        className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden border-2 border-gray-300"
      >
        {/* Header */}
        <div
          style={{ backgroundColor: "#ffffff" }}
          className="bg-white px-6 py-4 border-b-2 border-gray-300 flex justify-between items-center"
        >
          <h2
            id="modal-title"
            style={{ color: "#000000" }}
            className="text-xl font-bold text-black"
          >
            Posición {itemLabel}
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="text-gray-700 hover:text-black transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div
          style={{ backgroundColor: "#ffffff" }}
          className="p-6 max-h-96 overflow-y-auto bg-white"
        >
          {floors.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-300 mb-3">
                <svg
                  className="w-12 h-12 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <p style={{ color: "#000000" }} className="text-black text-sm">
                No hay productos almacenados
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {floors.map((floor) => (
                <li
                  key={floor.level}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold shadow-sm">
                      {floor.level}
                    </div>
                    <span
                      style={{ color: "#000000" }}
                      className="text-black font-bold text-sm"
                    >
                      Piso {floor.level}
                    </span>
                  </div>
                  {floor.materials.length === 0 ? (
                    <p
                      style={{ color: "#666666" }}
                      className="text-gray-600 text-xs ml-11"
                    >
                      Sin materiales
                    </p>
                  ) : (
                    <ul className="ml-11 space-y-1">
                      {floor.materials.map((material, idx) => (
                        <li
                          key={idx}
                          style={{ color: "#000000" }}
                          className="text-black text-xs font-mono bg-white px-2 py-1 rounded border border-gray-200"
                        >
                          {material}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div
          style={{ backgroundColor: "#ffffff" }}
          className="bg-white px-6 py-4 border-t-2 border-gray-300 flex justify-end"
        >
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
