const COLOUR_HEX: Record<string, string> = {
  black: "#1a1a1a",
  white: "#ffffff",
  pink: "#f4a6c1",
  red: "#c0392b",
  yellow: "#f1c40f",
  blue: "#3b6ea5",
  brown: "#7b5236",
  grey: "#9b9b9b",
  gray: "#9b9b9b",
  purple: "#7d5ba6",
  orange: "#e08a2c",
  maroon: "#5c1a25",
  burgundy: "#6e1423",
  olive: "#6b6b3a",
  beige: "#e8dcc8",
  "amber brown": "#8a5a2b",
  "olive green": "#6b6b3a",
  "dark brown": "#4a2e1a",
  "hot pink": "#e63988",
};

const FALLBACK_HEX = "#cccccc";

export function colourToHex(colour: string): string {
  return COLOUR_HEX[colour.trim().toLowerCase()] ?? FALLBACK_HEX;
}
