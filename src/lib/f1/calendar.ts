export interface GPThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
}

export interface GrandPrix {
  slug: string;
  name: string;
  country: string;
  countryCode: string;
  circuit: string;
  round: number;
  hasSprint: boolean;
  dates: {
    qualiStart: string;
    qualiEnd: string;
    sprintDate?: string;
    raceDate: string;
  };
  themeColors: GPThemeColors;
}

export type GPStatus = "upcoming" | "qualifying" | "sprint" | "race_day" | "finished";

export const F1_2025_CALENDAR: GrandPrix[] = [
  {
    slug: "australia-2025", name: "Australian Grand Prix", country: "Australia", countryCode: "AU",
    circuit: "Albert Park Circuit", round: 1, hasSprint: false,
    dates: { qualiStart: "2025-03-10T00:00:00Z", qualiEnd: "2025-03-14T23:59:59Z", raceDate: "2025-03-16T05:00:00Z" },
    themeColors: { primary: "#00843D", secondary: "#FFCD00", accent: "#002B7F", bg: "#0a1a0f" },
  },
  {
    slug: "china-2025", name: "Chinese Grand Prix", country: "China", countryCode: "CN",
    circuit: "Shanghai International Circuit", round: 2, hasSprint: true,
    dates: { qualiStart: "2025-03-17T00:00:00Z", qualiEnd: "2025-03-21T23:59:59Z", sprintDate: "2025-03-22T07:00:00Z", raceDate: "2025-03-23T07:00:00Z" },
    themeColors: { primary: "#DE2910", secondary: "#FFDE00", accent: "#DE2910", bg: "#1a0a0a" },
  },
  {
    slug: "japan-2025", name: "Japanese Grand Prix", country: "Japan", countryCode: "JP",
    circuit: "Suzuka International Racing Course", round: 3, hasSprint: false,
    dates: { qualiStart: "2025-03-31T00:00:00Z", qualiEnd: "2025-04-04T23:59:59Z", raceDate: "2025-04-06T06:00:00Z" },
    themeColors: { primary: "#BC002D", secondary: "#FFFFFF", accent: "#BC002D", bg: "#1a0a0f" },
  },
  {
    slug: "bahrain-2025", name: "Bahrain Grand Prix", country: "Bahrain", countryCode: "BH",
    circuit: "Bahrain International Circuit", round: 4, hasSprint: false,
    dates: { qualiStart: "2025-04-07T00:00:00Z", qualiEnd: "2025-04-11T23:59:59Z", raceDate: "2025-04-13T15:00:00Z" },
    themeColors: { primary: "#CE1126", secondary: "#FFFFFF", accent: "#CE1126", bg: "#1a0f0a" },
  },
  {
    slug: "saudi-arabia-2025", name: "Saudi Arabian Grand Prix", country: "Saudi Arabia", countryCode: "SA",
    circuit: "Jeddah Corniche Circuit", round: 5, hasSprint: false,
    dates: { qualiStart: "2025-04-14T00:00:00Z", qualiEnd: "2025-04-18T23:59:59Z", raceDate: "2025-04-20T17:00:00Z" },
    themeColors: { primary: "#006C35", secondary: "#FFFFFF", accent: "#006C35", bg: "#0a1a0f" },
  },
  {
    slug: "miami-2025", name: "Miami Grand Prix", country: "United States", countryCode: "US",
    circuit: "Miami International Autodrome", round: 6, hasSprint: true,
    dates: { qualiStart: "2025-04-28T00:00:00Z", qualiEnd: "2025-05-02T23:59:59Z", sprintDate: "2025-05-03T20:00:00Z", raceDate: "2025-05-04T20:00:00Z" },
    themeColors: { primary: "#F4C300", secondary: "#E8318A", accent: "#00B8D4", bg: "#0f1a1a" },
  },
  {
    slug: "emilia-romagna-2025", name: "Emilia Romagna Grand Prix", country: "Italy", countryCode: "IT",
    circuit: "Autodromo Enzo e Dino Ferrari", round: 7, hasSprint: false,
    dates: { qualiStart: "2025-05-12T00:00:00Z", qualiEnd: "2025-05-16T23:59:59Z", raceDate: "2025-05-18T13:00:00Z" },
    themeColors: { primary: "#008C45", secondary: "#CD212A", accent: "#FFFFFF", bg: "#0a1a0f" },
  },
  {
    slug: "monaco-2025", name: "Monaco Grand Prix", country: "Monaco", countryCode: "MC",
    circuit: "Circuit de Monaco", round: 8, hasSprint: false,
    dates: { qualiStart: "2025-05-19T00:00:00Z", qualiEnd: "2025-05-23T23:59:59Z", raceDate: "2025-05-25T13:00:00Z" },
    themeColors: { primary: "#CE1126", secondary: "#FFFFFF", accent: "#CE1126", bg: "#1a0a0a" },
  },
  {
    slug: "spain-2025", name: "Spanish Grand Prix", country: "Spain", countryCode: "ES",
    circuit: "Circuit de Barcelona-Catalunya", round: 9, hasSprint: false,
    dates: { qualiStart: "2025-05-26T00:00:00Z", qualiEnd: "2025-05-30T23:59:59Z", raceDate: "2025-06-01T13:00:00Z" },
    themeColors: { primary: "#AA151B", secondary: "#F1BF00", accent: "#AA151B", bg: "#1a0f0a" },
  },
  {
    slug: "canada-2025", name: "Canadian Grand Prix", country: "Canada", countryCode: "CA",
    circuit: "Circuit Gilles Villeneuve", round: 10, hasSprint: false,
    dates: { qualiStart: "2025-06-09T00:00:00Z", qualiEnd: "2025-06-13T23:59:59Z", raceDate: "2025-06-15T18:00:00Z" },
    themeColors: { primary: "#FF0000", secondary: "#FFFFFF", accent: "#FF0000", bg: "#1a0a0a" },
  },
  {
    slug: "austria-2025", name: "Austrian Grand Prix", country: "Austria", countryCode: "AT",
    circuit: "Red Bull Ring", round: 11, hasSprint: true,
    dates: { qualiStart: "2025-06-23T00:00:00Z", qualiEnd: "2025-06-27T23:59:59Z", sprintDate: "2025-06-28T13:00:00Z", raceDate: "2025-06-29T13:00:00Z" },
    themeColors: { primary: "#ED2939", secondary: "#FFFFFF", accent: "#ED2939", bg: "#1a0a0a" },
  },
  {
    slug: "great-britain-2025", name: "British Grand Prix", country: "Great Britain", countryCode: "GB",
    circuit: "Silverstone Circuit", round: 12, hasSprint: false,
    dates: { qualiStart: "2025-06-30T00:00:00Z", qualiEnd: "2025-07-04T23:59:59Z", raceDate: "2025-07-06T14:00:00Z" },
    themeColors: { primary: "#012169", secondary: "#C8102E", accent: "#FFFFFF", bg: "#0a0f1a" },
  },
  {
    slug: "belgium-2025", name: "Belgian Grand Prix", country: "Belgium", countryCode: "BE",
    circuit: "Circuit de Spa-Francorchamps", round: 13, hasSprint: true,
    dates: { qualiStart: "2025-07-21T00:00:00Z", qualiEnd: "2025-07-25T23:59:59Z", sprintDate: "2025-07-26T14:00:00Z", raceDate: "2025-07-27T13:00:00Z" },
    themeColors: { primary: "#000000", secondary: "#FDDA24", accent: "#EF3340", bg: "#1a1a0a" },
  },
  {
    slug: "hungary-2025", name: "Hungarian Grand Prix", country: "Hungary", countryCode: "HU",
    circuit: "Hungaroring", round: 14, hasSprint: false,
    dates: { qualiStart: "2025-07-28T00:00:00Z", qualiEnd: "2025-08-01T23:59:59Z", raceDate: "2025-08-03T13:00:00Z" },
    themeColors: { primary: "#CE2939", secondary: "#FFFFFF", accent: "#477050", bg: "#1a0a0a" },
  },
  {
    slug: "netherlands-2025", name: "Dutch Grand Prix", country: "Netherlands", countryCode: "NL",
    circuit: "Circuit Zandvoort", round: 15, hasSprint: false,
    dates: { qualiStart: "2025-08-25T00:00:00Z", qualiEnd: "2025-08-29T23:59:59Z", raceDate: "2025-08-31T13:00:00Z" },
    themeColors: { primary: "#FF6600", secondary: "#FFFFFF", accent: "#21468B", bg: "#1a0f0a" },
  },
  {
    slug: "italy-2025", name: "Italian Grand Prix", country: "Italy", countryCode: "IT",
    circuit: "Autodromo Nazionale di Monza", round: 16, hasSprint: false,
    dates: { qualiStart: "2025-09-01T00:00:00Z", qualiEnd: "2025-09-05T23:59:59Z", raceDate: "2025-09-07T13:00:00Z" },
    themeColors: { primary: "#008C45", secondary: "#CD212A", accent: "#FFFFFF", bg: "#0a1a0f" },
  },
  {
    slug: "azerbaijan-2025", name: "Azerbaijan Grand Prix", country: "Azerbaijan", countryCode: "AZ",
    circuit: "Baku City Circuit", round: 17, hasSprint: false,
    dates: { qualiStart: "2025-09-15T00:00:00Z", qualiEnd: "2025-09-19T23:59:59Z", raceDate: "2025-09-21T11:00:00Z" },
    themeColors: { primary: "#0092BC", secondary: "#E4002B", accent: "#00AF66", bg: "#0a1a1a" },
  },
  {
    slug: "singapore-2025", name: "Singapore Grand Prix", country: "Singapore", countryCode: "SG",
    circuit: "Marina Bay Street Circuit", round: 18, hasSprint: false,
    dates: { qualiStart: "2025-09-29T00:00:00Z", qualiEnd: "2025-10-03T23:59:59Z", raceDate: "2025-10-05T12:00:00Z" },
    themeColors: { primary: "#EF3340", secondary: "#FFFFFF", accent: "#EF3340", bg: "#1a0a0a" },
  },
  {
    slug: "usa-2025", name: "United States Grand Prix", country: "United States", countryCode: "US",
    circuit: "Circuit of the Americas", round: 19, hasSprint: true,
    dates: { qualiStart: "2025-10-13T00:00:00Z", qualiEnd: "2025-10-17T23:59:59Z", sprintDate: "2025-10-18T19:00:00Z", raceDate: "2025-10-19T19:00:00Z" },
    themeColors: { primary: "#B31942", secondary: "#0A3161", accent: "#FFFFFF", bg: "#0f0a1a" },
  },
  {
    slug: "mexico-2025", name: "Mexico City Grand Prix", country: "Mexico", countryCode: "MX",
    circuit: "Autodromo Hermanos Rodriguez", round: 20, hasSprint: false,
    dates: { qualiStart: "2025-10-20T00:00:00Z", qualiEnd: "2025-10-24T23:59:59Z", raceDate: "2025-10-26T20:00:00Z" },
    themeColors: { primary: "#006847", secondary: "#CE1126", accent: "#FFFFFF", bg: "#0a1a0f" },
  },
  {
    slug: "brazil-2025", name: "Sao Paulo Grand Prix", country: "Brazil", countryCode: "BR",
    circuit: "Autodromo Jose Carlos Pace", round: 21, hasSprint: true,
    dates: { qualiStart: "2025-10-27T00:00:00Z", qualiEnd: "2025-10-31T23:59:59Z", sprintDate: "2025-11-01T17:00:00Z", raceDate: "2025-11-02T17:00:00Z" },
    themeColors: { primary: "#009739", secondary: "#FEDD00", accent: "#002776", bg: "#0a1a0f" },
  },
  {
    slug: "las-vegas-2025", name: "Las Vegas Grand Prix", country: "United States", countryCode: "US",
    circuit: "Las Vegas Strip Circuit", round: 22, hasSprint: false,
    dates: { qualiStart: "2025-11-17T00:00:00Z", qualiEnd: "2025-11-21T23:59:59Z", raceDate: "2025-11-22T06:00:00Z" },
    themeColors: { primary: "#FFD700", secondary: "#000000", accent: "#FF1493", bg: "#1a1a0a" },
  },
  {
    slug: "qatar-2025", name: "Qatar Grand Prix", country: "Qatar", countryCode: "QA",
    circuit: "Lusail International Circuit", round: 23, hasSprint: true,
    dates: { qualiStart: "2025-11-24T00:00:00Z", qualiEnd: "2025-11-28T23:59:59Z", sprintDate: "2025-11-29T16:00:00Z", raceDate: "2025-11-30T16:00:00Z" },
    themeColors: { primary: "#8A1538", secondary: "#FFFFFF", accent: "#8A1538", bg: "#1a0a0f" },
  },
  {
    slug: "abu-dhabi-2025", name: "Abu Dhabi Grand Prix", country: "United Arab Emirates", countryCode: "AE",
    circuit: "Yas Marina Circuit", round: 24, hasSprint: false,
    dates: { qualiStart: "2025-12-01T00:00:00Z", qualiEnd: "2025-12-05T23:59:59Z", raceDate: "2025-12-07T13:00:00Z" },
    themeColors: { primary: "#00732F", secondary: "#FFFFFF", accent: "#FF0000", bg: "#0a1a0f" },
  },
];

export const F1_2026_CALENDAR: GrandPrix[] = [
  {
    slug: "australia-2026", name: "Australian Grand Prix", country: "Australia", countryCode: "AU",
    circuit: "Melbourne Grand Prix Circuit", round: 1, hasSprint: false,
    dates: { qualiStart: "2026-03-02T00:00:00Z", qualiEnd: "2026-03-06T23:59:59Z", raceDate: "2026-03-08T05:00:00Z" },
    themeColors: { primary: "#00843D", secondary: "#FFCD00", accent: "#002B7F", bg: "#0a1a0f" },
  },
  {
    slug: "china-2026", name: "Chinese Grand Prix", country: "China", countryCode: "CN",
    circuit: "Shanghai International Circuit", round: 2, hasSprint: false,
    dates: { qualiStart: "2026-03-09T00:00:00Z", qualiEnd: "2026-03-13T23:59:59Z", raceDate: "2026-03-15T07:00:00Z" },
    themeColors: { primary: "#DE2910", secondary: "#FFDE00", accent: "#DE2910", bg: "#1a0a0a" },
  },
  {
    slug: "japan-2026", name: "Japanese Grand Prix", country: "Japan", countryCode: "JP",
    circuit: "Suzuka International Racing Course", round: 3, hasSprint: false,
    dates: { qualiStart: "2026-03-23T00:00:00Z", qualiEnd: "2026-03-27T23:59:59Z", raceDate: "2026-03-29T06:00:00Z" },
    themeColors: { primary: "#BC002D", secondary: "#FFFFFF", accent: "#BC002D", bg: "#1a0a0f" },
  },
  {
    slug: "miami-2026", name: "Miami Grand Prix", country: "United States", countryCode: "US",
    circuit: "Miami International Autodrome", round: 4, hasSprint: true,
    dates: { qualiStart: "2026-04-27T00:00:00Z", qualiEnd: "2026-05-01T23:59:59Z", sprintDate: "2026-05-02T20:00:00Z", raceDate: "2026-05-03T20:00:00Z" },
    themeColors: { primary: "#F4C300", secondary: "#E8318A", accent: "#00B8D4", bg: "#0f1a1a" },
  },
  {
    slug: "canada-2026", name: "Canadian Grand Prix", country: "Canada", countryCode: "CA",
    circuit: "Circuit Gilles Villeneuve", round: 5, hasSprint: false,
    dates: { qualiStart: "2026-05-18T00:00:00Z", qualiEnd: "2026-05-22T23:59:59Z", raceDate: "2026-05-24T18:00:00Z" },
    themeColors: { primary: "#FF0000", secondary: "#FFFFFF", accent: "#FF0000", bg: "#1a0a0a" },
  },
  {
    slug: "monaco-2026", name: "Monaco Grand Prix", country: "Monaco", countryCode: "MC",
    circuit: "Circuit de Monte Carlo", round: 6, hasSprint: false,
    dates: { qualiStart: "2026-06-01T00:00:00Z", qualiEnd: "2026-06-05T23:59:59Z", raceDate: "2026-06-07T13:00:00Z" },
    themeColors: { primary: "#CE1126", secondary: "#FFFFFF", accent: "#CE1126", bg: "#1a0a0a" },
  },
  {
    slug: "barcelona-2026", name: "Barcelona Grand Prix", country: "Spain", countryCode: "ES",
    circuit: "Circuit de Barcelona-Catalunya", round: 7, hasSprint: false,
    dates: { qualiStart: "2026-06-08T00:00:00Z", qualiEnd: "2026-06-12T23:59:59Z", raceDate: "2026-06-14T13:00:00Z" },
    themeColors: { primary: "#AA151B", secondary: "#F1BF00", accent: "#AA151B", bg: "#1a0f0a" },
  },
  {
    slug: "austria-2026", name: "Austrian Grand Prix", country: "Austria", countryCode: "AT",
    circuit: "Red Bull Ring", round: 8, hasSprint: true,
    dates: { qualiStart: "2026-06-22T00:00:00Z", qualiEnd: "2026-06-26T23:59:59Z", sprintDate: "2026-06-27T13:00:00Z", raceDate: "2026-06-28T13:00:00Z" },
    themeColors: { primary: "#ED2939", secondary: "#FFFFFF", accent: "#ED2939", bg: "#1a0a0a" },
  },
  {
    slug: "great-britain-2026", name: "British Grand Prix", country: "Great Britain", countryCode: "GB",
    circuit: "Silverstone Circuit", round: 9, hasSprint: false,
    dates: { qualiStart: "2026-06-29T00:00:00Z", qualiEnd: "2026-07-03T23:59:59Z", raceDate: "2026-07-05T14:00:00Z" },
    themeColors: { primary: "#012169", secondary: "#C8102E", accent: "#FFFFFF", bg: "#0a0f1a" },
  },
  {
    slug: "belgium-2026", name: "Belgian Grand Prix", country: "Belgium", countryCode: "BE",
    circuit: "Circuit de Spa-Francorchamps", round: 10, hasSprint: false,
    dates: { qualiStart: "2026-07-13T00:00:00Z", qualiEnd: "2026-07-17T23:59:59Z", raceDate: "2026-07-19T13:00:00Z" },
    themeColors: { primary: "#000000", secondary: "#FDDA24", accent: "#EF3340", bg: "#1a1a0a" },
  },
  {
    slug: "hungary-2026", name: "Hungarian Grand Prix", country: "Hungary", countryCode: "HU",
    circuit: "Hungaroring", round: 11, hasSprint: false,
    dates: { qualiStart: "2026-07-20T00:00:00Z", qualiEnd: "2026-07-24T23:59:59Z", raceDate: "2026-07-26T13:00:00Z" },
    themeColors: { primary: "#CE2939", secondary: "#FFFFFF", accent: "#477050", bg: "#1a0a0a" },
  },
  {
    slug: "netherlands-2026", name: "Dutch Grand Prix", country: "Netherlands", countryCode: "NL",
    circuit: "Circuit Zandvoort", round: 12, hasSprint: false,
    dates: { qualiStart: "2026-08-17T00:00:00Z", qualiEnd: "2026-08-21T23:59:59Z", raceDate: "2026-08-23T13:00:00Z" },
    themeColors: { primary: "#FF6600", secondary: "#FFFFFF", accent: "#21468B", bg: "#1a0f0a" },
  },
  {
    slug: "italy-2026", name: "Italian Grand Prix", country: "Italy", countryCode: "IT",
    circuit: "Autodromo Nazionale di Monza", round: 13, hasSprint: false,
    dates: { qualiStart: "2026-08-31T00:00:00Z", qualiEnd: "2026-09-04T23:59:59Z", raceDate: "2026-09-06T13:00:00Z" },
    themeColors: { primary: "#008C45", secondary: "#CD212A", accent: "#FFFFFF", bg: "#0a1a0f" },
  },
  {
    slug: "spain-madrid-2026", name: "Spanish Grand Prix", country: "Spain", countryCode: "ES",
    circuit: "Circuito de Madrid", round: 14, hasSprint: false,
    dates: { qualiStart: "2026-09-07T00:00:00Z", qualiEnd: "2026-09-11T23:59:59Z", raceDate: "2026-09-13T13:00:00Z" },
    themeColors: { primary: "#AA151B", secondary: "#F1BF00", accent: "#AA151B", bg: "#1a0f0a" },
  },
  {
    slug: "azerbaijan-2026", name: "Azerbaijan Grand Prix", country: "Azerbaijan", countryCode: "AZ",
    circuit: "Baku City Circuit", round: 15, hasSprint: false,
    dates: { qualiStart: "2026-09-21T00:00:00Z", qualiEnd: "2026-09-25T23:59:59Z", raceDate: "2026-09-26T11:00:00Z" },
    themeColors: { primary: "#0092BC", secondary: "#E4002B", accent: "#00AF66", bg: "#0a1a1a" },
  },
  {
    slug: "singapore-2026", name: "Singapore Grand Prix", country: "Singapore", countryCode: "SG",
    circuit: "Marina Bay Street Circuit", round: 16, hasSprint: false,
    dates: { qualiStart: "2026-10-05T00:00:00Z", qualiEnd: "2026-10-09T23:59:59Z", raceDate: "2026-10-11T12:00:00Z" },
    themeColors: { primary: "#EF3340", secondary: "#FFFFFF", accent: "#EF3340", bg: "#1a0a0a" },
  },
  {
    slug: "usa-2026", name: "United States Grand Prix", country: "United States", countryCode: "US",
    circuit: "Circuit of the Americas", round: 17, hasSprint: true,
    dates: { qualiStart: "2026-10-19T00:00:00Z", qualiEnd: "2026-10-23T23:59:59Z", sprintDate: "2026-10-24T19:00:00Z", raceDate: "2026-10-25T19:00:00Z" },
    themeColors: { primary: "#B31942", secondary: "#0A3161", accent: "#FFFFFF", bg: "#0f0a1a" },
  },
  {
    slug: "mexico-2026", name: "Mexico City Grand Prix", country: "Mexico", countryCode: "MX",
    circuit: "Autodromo Hermanos Rodriguez", round: 18, hasSprint: false,
    dates: { qualiStart: "2026-10-26T00:00:00Z", qualiEnd: "2026-10-30T23:59:59Z", raceDate: "2026-11-01T20:00:00Z" },
    themeColors: { primary: "#006847", secondary: "#CE1126", accent: "#FFFFFF", bg: "#0a1a0f" },
  },
  {
    slug: "brazil-2026", name: "Sao Paulo Grand Prix", country: "Brazil", countryCode: "BR",
    circuit: "Autodromo Jose Carlos Pace", round: 19, hasSprint: true,
    dates: { qualiStart: "2026-11-02T00:00:00Z", qualiEnd: "2026-11-06T23:59:59Z", sprintDate: "2026-11-07T17:00:00Z", raceDate: "2026-11-08T17:00:00Z" },
    themeColors: { primary: "#009739", secondary: "#FEDD00", accent: "#002776", bg: "#0a1a0f" },
  },
  {
    slug: "las-vegas-2026", name: "Las Vegas Grand Prix", country: "United States", countryCode: "US",
    circuit: "Las Vegas Strip Circuit", round: 20, hasSprint: false,
    dates: { qualiStart: "2026-11-16T00:00:00Z", qualiEnd: "2026-11-20T23:59:59Z", raceDate: "2026-11-21T06:00:00Z" },
    themeColors: { primary: "#FFD700", secondary: "#000000", accent: "#FF1493", bg: "#1a1a0a" },
  },
  {
    slug: "qatar-2026", name: "Qatar Grand Prix", country: "Qatar", countryCode: "QA",
    circuit: "Lusail International Circuit", round: 21, hasSprint: true,
    dates: { qualiStart: "2026-11-23T00:00:00Z", qualiEnd: "2026-11-27T23:59:59Z", sprintDate: "2026-11-28T16:00:00Z", raceDate: "2026-11-29T16:00:00Z" },
    themeColors: { primary: "#8A1538", secondary: "#FFFFFF", accent: "#8A1538", bg: "#1a0a0f" },
  },
  {
    slug: "abu-dhabi-2026", name: "Abu Dhabi Grand Prix", country: "United Arab Emirates", countryCode: "AE",
    circuit: "Yas Marina Circuit", round: 22, hasSprint: false,
    dates: { qualiStart: "2026-11-30T00:00:00Z", qualiEnd: "2026-12-04T23:59:59Z", raceDate: "2026-12-06T13:00:00Z" },
    themeColors: { primary: "#00732F", secondary: "#FFFFFF", accent: "#FF0000", bg: "#0a1a0f" },
  },
];

// Combined calendar — all GPs across seasons
export const ALL_GPS: GrandPrix[] = [...F1_2025_CALENDAR, ...F1_2026_CALENDAR];

// Demo date override for development — set NEXT_PUBLIC_DEMO_DATE in .env.local
// Example: NEXT_PUBLIC_DEMO_DATE=2025-07-30T12:00:00Z (Hungarian GP qualifying)
export function getNow(): Date {
  const demoDate = typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_DEMO_DATE
    : process.env.NEXT_PUBLIC_DEMO_DATE;
  if (demoDate) return new Date(demoDate);
  return new Date();
}

const DEFAULT_THEME: GPThemeColors = {
  primary: "#E10600",
  secondary: "#FFFFFF",
  accent: "#15151E",
  bg: "#111111",
};

export function getGPStatus(gp: GrandPrix, now: Date = getNow()): GPStatus {
  const qualiStart = new Date(gp.dates.qualiStart);
  const qualiEnd = new Date(gp.dates.qualiEnd);
  const raceDate = new Date(gp.dates.raceDate);
  const raceEnd = new Date(raceDate.getTime() + 3 * 60 * 60 * 1000); // +3h after race start

  if (now < qualiStart) return "upcoming";
  if (now >= qualiStart && now <= qualiEnd) return "qualifying";
  if (gp.hasSprint && gp.dates.sprintDate) {
    const sprintDate = new Date(gp.dates.sprintDate);
    const sprintEnd = new Date(sprintDate.getTime() + 2 * 60 * 60 * 1000);
    if (now >= sprintDate && now <= sprintEnd) return "sprint";
  }
  if (now > qualiEnd && now < raceEnd) return "race_day";
  if (now >= raceEnd) return "finished";
  return "upcoming";
}

export function getCurrentGP(now: Date = getNow()): GrandPrix | null {
  // Find a GP that is currently active (qualifying, sprint, or race day)
  for (const gp of ALL_GPS) {
    const status = getGPStatus(gp, now);
    if (status === "qualifying" || status === "sprint" || status === "race_day") {
      return gp;
    }
  }
  return null;
}

export function getNextGP(now: Date = getNow()): GrandPrix | null {
  for (const gp of ALL_GPS) {
    const status = getGPStatus(gp, now);
    if (status === "upcoming") return gp;
    if (status === "qualifying" || status === "sprint" || status === "race_day") return gp;
  }
  return null;
}

// Returns the most relevant GP to display: current > next > last finished
export function getMostRelevantGP(now: Date = getNow()): GrandPrix | null {
  const current = getCurrentGP(now);
  if (current) return current;

  const next = getNextGP(now);
  if (next) return next;

  // Off-season or all GPs finished — return last GP
  for (let i = ALL_GPS.length - 1; i >= 0; i--) {
    if (getGPStatus(ALL_GPS[i], now) === "finished") {
      return ALL_GPS[i];
    }
  }

  // Fallback: first GP (pre-season)
  return ALL_GPS[0] ?? null;
}

export function getGPBySlug(slug: string): GrandPrix | null {
  return ALL_GPS.find((gp) => gp.slug === slug) ?? null;
}

export function isQualifyingActive(gp: GrandPrix, now: Date = getNow()): boolean {
  return getGPStatus(gp, now) === "qualifying";
}

export function isRaceDay(gp: GrandPrix, now: Date = getNow()): boolean {
  return getGPStatus(gp, now) === "race_day";
}

export function getCurrentTheme(now: Date = getNow()): GPThemeColors {
  const gp = getCurrentGP(now) ?? getNextGP(now);
  return gp?.themeColors ?? DEFAULT_THEME;
}
