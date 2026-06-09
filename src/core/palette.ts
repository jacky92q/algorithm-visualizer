// Shared color palette — cream base, warm brown, teal accents.
// Used by both the canvas renderers and (mirrored) the CSS design tokens.
export const PALETTE = {
  paper: '#FFFBF2',
  cream: '#FBF7EF',
  cream2: '#F3E9D6',
  cream3: '#E9DCC2',
  line: '#E0D2B8',

  ink: '#2E241B',
  inkSoft: '#6B5A48',
  inkFaint: '#9A8B70',

  brown: '#6F4E37',
  brownDark: '#4A3528',
  brownSoft: '#A8835E',

  teal: '#2A9D8F',
  tealDark: '#1E7A6F',
  tealSoft: '#5FC3B6',

  amber: '#E0A33B',
  amberDeep: '#C9821C',
  coral: '#E07856',
  coralDeep: '#C85A3A',
  rose: '#D2607A',
  plum: '#8A5A8C',
} as const;

export type Palette = typeof PALETTE;

// Convert hex to rgba string with given alpha.
export function rgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Linear interpolate two hex colors. t in [0,1].
export function mixHex(a: string, b: string, t: number): string {
  const pa = a.replace('#', '');
  const pb = b.replace('#', '');
  const ar = parseInt(pa.slice(0, 2), 16);
  const ag = parseInt(pa.slice(2, 4), 16);
  const ab = parseInt(pa.slice(4, 6), 16);
  const br = parseInt(pb.slice(0, 2), 16);
  const bg = parseInt(pb.slice(2, 4), 16);
  const bb = parseInt(pb.slice(4, 6), 16);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `rgb(${r}, ${g}, ${bl})`;
}
