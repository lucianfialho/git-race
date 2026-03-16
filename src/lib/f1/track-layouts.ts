// Maps GP slug to track SVG file in /public/tracks/
// SVGs sourced from github.com/julesr0y/f1-circuits-svg (MIT license)

const TRACK_FILES: Record<string, string> = {
  "australia-2025": "/tracks/australia.svg",
  "china-2025": "/tracks/china.svg",
  "japan-2025": "/tracks/japan.svg",
  "bahrain-2025": "/tracks/bahrain.svg",
  "saudi-arabia-2025": "/tracks/saudi-arabia.svg",
  "miami-2025": "/tracks/miami.svg",
  "emilia-romagna-2025": "/tracks/emilia-romagna.svg",
  "monaco-2025": "/tracks/monaco.svg",
  "spain-2025": "/tracks/spain.svg",
  "canada-2025": "/tracks/canada.svg",
  "austria-2025": "/tracks/austria.svg",
  "great-britain-2025": "/tracks/great-britain.svg",
  "belgium-2025": "/tracks/belgium.svg",
  "hungary-2025": "/tracks/hungary.svg",
  "netherlands-2025": "/tracks/netherlands.svg",
  "italy-2025": "/tracks/italy.svg",
  "azerbaijan-2025": "/tracks/azerbaijan.svg",
  "singapore-2025": "/tracks/singapore.svg",
  "usa-2025": "/tracks/usa.svg",
  "mexico-2025": "/tracks/mexico.svg",
  "brazil-2025": "/tracks/brazil.svg",
  "las-vegas-2025": "/tracks/las-vegas.svg",
  "qatar-2025": "/tracks/qatar.svg",
  "abu-dhabi-2025": "/tracks/abu-dhabi.svg",
};

export function getTrackImage(gpSlug: string): string | null {
  return TRACK_FILES[gpSlug] ?? null;
}
