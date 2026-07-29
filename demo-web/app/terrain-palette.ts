export const TERRAIN_PALETTE = [
  "#152e2a",
  "#1e4038",
  "#2c5143",
  "#42634d",
  "#5c7556",
  "#788760",
  "#96996b",
  "#b1aa76",
  "#cab984",
  "#ddc996",
  "#ead8ad",
  "#f1e5c7",
] as const;

const HEX_COLOR = /^#[\da-f]{6}$/i;

export function colorForValue(normalized: number): string {
  const safeNormalized = Number.isFinite(normalized)
    ? Math.max(0, Math.min(1, normalized))
    : 0;
  const index = Math.max(
    0,
    Math.min(
      TERRAIN_PALETTE.length - 1,
      Math.floor(safeNormalized * TERRAIN_PALETTE.length),
    ),
  );

  return TERRAIN_PALETTE[index] ?? TERRAIN_PALETTE[0];
}

export function hexToRgb(color: string): [number, number, number] {
  const safeColor = HEX_COLOR.test(color) ? color : TERRAIN_PALETTE[0];
  return [
    Number.parseInt(safeColor.slice(1, 3), 16),
    Number.parseInt(safeColor.slice(3, 5), 16),
    Number.parseInt(safeColor.slice(5, 7), 16),
  ];
}
