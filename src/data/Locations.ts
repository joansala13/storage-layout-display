// Archivo generado manualmente: src/data/Locations.ts
// Objetivo: a partir de códigos NNPPPHH (2 dígitos pasillo, 3 dígitos posición, 2 dígitos altura)
// agrupar por pasillo+posición y crear un objeto por "caja" con un array floors ordenado por altura.
// No ejecuta scripts: puedes usar loadLocations() para cargar /public/Location.txt en runtime.

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

// Parámetros de layout
// Cada pasillo (NN) = una FILA horizontal
// Cada posición (PPP) = una COLUMNA dentro de esa fila
export const BOX_WIDTH = 50; // px - ancho de cada caja
export const BOX_HEIGHT = 35; // px - alto de cada caja
export const GAP_X = 8; // px - espacio entre posiciones (columnas)
export const GAP_Y = 15; // px - espacio entre pasillos (filas)
export const MARGIN = 20; // px - margen exterior

// Reglas y supuestos:
// - Se procesan solo líneas que sean estrictamente 7 dígitos (^[0-9]{7}$)
// - Se ignoran líneas con letras u otros formatos (Z..., PB..., 0201D03, etc.)
// - Por defecto se EXCLUYEN alturas "00" al construir los pisos, ya que suelen indicar cabecera/no-ubicación
//   Si necesitas incluirlas, pasa includeHeightZero=true en las opciones de parseo.

export type ParseOptions = {
  includeHeightZero?: boolean;
};

/** Extrae únicamente los códigos de 7 dígitos válidos del texto bruto. */
export function extract7DigitCodes(
  text: string,
  { includeHeightZero = false }: ParseOptions = {}
): string[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim());
  console.log(`📄 Total de líneas en archivo: ${lines.length}`);

  // Limpiar comillas, comas y espacios: "0300104", -> 0300104
  const cleanedLines = lines.map((l) => l.replace(/["',\s]/g, ""));

  const codes = cleanedLines.filter((l) => /^\d{7}$/.test(l));
  console.log(`🔢 Códigos de 7 dígitos encontrados: ${codes.length}`);

  if (!includeHeightZero) {
    const filtered = codes.filter((c) => c.slice(5, 7) !== "00");
    console.log(`✂️ Códigos después de filtrar altura 00: ${filtered.length}`);
    return filtered;
  }
  return codes;
} /** Convierte una lista de códigos NNPPPHH en objetos Position agrupando por NN-PPP. */
export function buildPositionsFromCodes(codes: string[]): Position[] {
  console.log(`🏗️ Construyendo posiciones desde ${codes.length} códigos`);

  // Agrupar por pasillo-posicion => set de alturas
  const groups = new Map<string, Set<string>>();
  for (const code of codes) {
    const aisle = code.slice(0, 2); // NN
    const pos = code.slice(2, 5); // PPP
    const height = code.slice(5, 7); // HH
    const key = `${aisle}-${pos}`;
    if (!groups.has(key)) groups.set(key, new Set());
    groups.get(key)!.add(height);
  }
  console.log(`📦 Grupos únicos (pasillo-posición): ${groups.size}`);

  // Índices compactos para layout
  const byAisle = new Map<string, Set<string>>();
  for (const key of groups.keys()) {
    const [aisle, pos] = key.split("-");
    if (!byAisle.has(aisle)) byAisle.set(aisle, new Set());
    byAisle.get(aisle)!.add(pos);
  }

  const aisles = Array.from(byAisle.keys()).sort(
    (a, b) => parseInt(a) - parseInt(b)
  );
  const aisleToIndex = new Map<string, number>();
  aisles.forEach((a, i) => aisleToIndex.set(a, i));

  const aislePosIndex = new Map<string, Map<string, number>>();
  for (const aisle of aisles) {
    const positions = Array.from(byAisle.get(aisle)!).sort(
      (a, b) => parseInt(a) - parseInt(b)
    );
    const m = new Map<string, number>();
    positions.forEach((p, i) => m.set(p, i));
    aislePosIndex.set(aisle, m);
  }

  const items: Position[] = [];
  for (const [key, heightsSet] of groups.entries()) {
    const [aisle, pos] = key.split("-");
    const aIndex = aisleToIndex.get(aisle)!;
    const pIndex = aislePosIndex.get(aisle)!.get(pos)!;

    // Pasillo = columna (X), posición = fila dentro de esa columna (Y)
    const x = MARGIN + aIndex * (BOX_WIDTH + GAP_X);
    const y = MARGIN + pIndex * (BOX_HEIGHT + GAP_Y);
    const heights = Array.from(heightsSet).sort(
      (a, b) => parseInt(a) - parseInt(b)
    );
    const floors = heights.map((h) => ({
      level: parseInt(h, 10),
      product: "",
    }));

    items.push({
      id: `${aisle}-${pos}`,
      x,
      y,
      width: BOX_WIDTH,
      height: BOX_HEIGHT,
      label: `${aisle}-${pos}`,
      color: undefined,
      floors,
    });
  }

  // Ordenar items por pasillo y posición para estabilidad
  items.sort((a, b) => {
    const [aA, aP] = a.id.split("-").map((t) => parseInt(t, 10));
    const [bA, bP] = b.id.split("-").map((t) => parseInt(t, 10));
    return aA - bA || aP - bP;
  });

  return items;
}

/**
 * Carga /public/Location.txt y devuelve las posiciones ya agrupadas.
 * Coloca tu Location.txt en la carpeta public con nombre "Location.txt".
 */
export async function loadLocations(
  url: string = "/Locations.txt",
  options?: ParseOptions
): Promise<Position[]> {
  const res = await fetch(url);
  if (!res.ok)
    throw new Error(
      `No se pudo cargar ${url}: ${res.status} ${res.statusText}`
    );
  const text = await res.text();
  const codes = extract7DigitCodes(text, options);
  return buildPositionsFromCodes(codes);
}

// Muestra mínima para probar la UI sin carga asíncrona (solo unos ejemplos)
// Ejemplo: 0300103 y 0300104 se convierten en una caja 03-001 con floors [3,4]
const sampleCodes = ["0300103", "0300104", "0501702", "0501703", "0700305"];
export const sampleLocations: Position[] = buildPositionsFromCodes(sampleCodes);

export default loadLocations;
