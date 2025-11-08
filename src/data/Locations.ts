// Archivo generado manualmente: src/data/Locations.ts
// Objetivo: a partir de códigos NNPPPHH (2 dígitos pasillo, 3 dígitos posición, 2 dígitos altura)
// agrupar por pasillo+posición y crear un objeto por "caja" con un array floors ordenado por altura.
// No ejecuta scripts: puedes usar loadLocations() para cargar /public/Location.txt en runtime.

export interface Floor {
  level: number;
  materials: string[]; // Array de códigos de materiales
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
// Cada pasillo (NN) = una columna vertical
// Cada posición (PPP) = una fila dentro de esa columna
export const BOX_WIDTH = 50; // px - ancho de cada caja
export const BOX_HEIGHT = 35; // px - alto de cada caja
export const GAP_X = 12; // px - espacio entre pasillos (columnas)
export const GAP_Y = 10; // px - espacio entre posiciones (filas)
export const MARGIN = 5; // px - pequeño margen exterior

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
      materials: [], // Sin materiales en el parseo antiguo
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

/**
 * Parsea el nuevo formato: "0300104", "A248755000|A248015001"
 * donde la primera columna es la localización NNPPPHH y la segunda son materiales separados por |
 */
export function parseLocationWithMaterials(text: string): Position[] {
  console.log("📄 Parseando archivo con materiales...");
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  console.log(`📄 Total de líneas: ${lines.length}`);

  // Estructura: Map de "NN-PPP" -> Map de altura -> array de materiales
  const groups = new Map<string, Map<number, string[]>>();

  for (const line of lines) {
    // Formato: "0300104", "A248755000|A248015001"
    const match = line.match(/"(\d{7})",\s*"([^"]*)"/);
    if (!match) continue;

    const code = match[1]; // NNPPPHH
    const materialsStr = match[2]; // "MAT1|MAT2|..."

    const aisle = code.slice(0, 2); // NN
    const pos = code.slice(2, 5); // PPP
    const height = parseInt(code.slice(5, 7), 10); // HH

    // Filtrar altura 00
    if (height === 0) continue;

    const key = `${aisle}-${pos}`;
    const materials = materialsStr
      .split("|")
      .filter((m) => m.trim().length > 0);

    if (!groups.has(key)) {
      groups.set(key, new Map());
    }
    const heightMap = groups.get(key)!;

    if (!heightMap.has(height)) {
      heightMap.set(height, []);
    }
    heightMap.get(height)!.push(...materials);
  }

  console.log(`📦 Grupos únicos (pasillo-posición): ${groups.size}`);

  // Calcular índices para layout (igual que buildPositionsFromCodes)
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
  for (const [key, heightMap] of groups.entries()) {
    const [aisle, pos] = key.split("-");
    const aIndex = aisleToIndex.get(aisle)!;
    const pIndex = aislePosIndex.get(aisle)!.get(pos)!;

    const x = MARGIN + aIndex * (BOX_WIDTH + GAP_X);
    const y = MARGIN + pIndex * (BOX_HEIGHT + GAP_Y);

    // Convertir Map de altura -> materiales a array de Floors ordenado
    const floors: Floor[] = Array.from(heightMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([level, materials]) => ({ level, materials }));

    items.push({
      id: key,
      x,
      y,
      width: BOX_WIDTH,
      height: BOX_HEIGHT,
      label: key,
      color: undefined,
      floors,
    });
  }

  // Ordenar por pasillo y posición
  items.sort((a, b) => {
    const [aA, aP] = a.id.split("-").map((t) => parseInt(t, 10));
    const [bA, bP] = b.id.split("-").map((t) => parseInt(t, 10));
    return aA - bA || aP - bP;
  });

  console.log(`✅ ${items.length} posiciones creadas con materiales`);
  return items;
}

/**
 * Carga el archivo con formato de materiales
 */
export async function loadLocationsWithMaterials(
  url: string = "/Location_updated_rule1.txt"
): Promise<Position[]> {
  const res = await fetch(url);
  if (!res.ok)
    throw new Error(
      `No se pudo cargar ${url}: ${res.status} ${res.statusText}`
    );
  const text = await res.text();
  return parseLocationWithMaterials(text);
}

// Muestra mínima para probar la UI sin carga asíncrona (solo unos ejemplos)
// Ejemplo: 0300103 y 0300104 se convierten en una caja 03-001 con floors [3,4]
const sampleCodes = ["0300103", "0300104", "0501702", "0501703", "0700305"];
export const sampleLocations: Position[] = buildPositionsFromCodes(sampleCodes);

export default loadLocations;
