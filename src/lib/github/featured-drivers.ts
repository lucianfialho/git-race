// Famous GitHub developers to feature as drivers
// Their public contribution data will be fetched and used as stats

export const FEATURED_GITHUB_USERS = [
  "torvalds",         // Linus Torvalds — Linux
  "gaborcsardi",      // Gábor Csárdi — R packages
  "sindresorhus",     // Sindre Sorhus — npm king
  "yyx990803",        // Evan You — Vue.js
  "gaearon",          // Dan Abramov — React
  "rauchg",           // Guillermo Rauch — Vercel
  "tj",               // TJ Holowaychuk — Express, Koa
  "antfu",            // Anthony Fu — Vite, Vitest
  "ThePrimeagen",     // ThePrimeagen
  "kentcdodds",       // Kent C. Dodds — Testing Library
  "developit",        // Jason Miller — Preact
  "shadcn",           // shadcn — shadcn/ui
  "t3dotgg",          // Theo — T3 stack
  "pilcrowOnPaper",   // pilcrow — Lucia auth
  "tiangolo",         // Sebastián Ramírez — FastAPI
  "mitchellh",        // Mitchell Hashimoto — Ghostty
  "leerob",           // Lee Robinson — Vercel
  "delba",            // Delba — Vercel
  "shuding",          // Shu Ding — SWR, Next.js
  "Rich-Harris",      // Rich Harris — Svelte
];

export interface FeaturedDriverData {
  username: string;
  avatar_url: string;
  name: string | null;
  bio: string | null;
  followers: number;
  public_repos: number;
  total_stars: number;
  top_languages: string[];
  // Simulated car stats based on public activity
  car_stats: {
    power_unit: number;
    aero: number;
    reliability: number;
    tire_mgmt: number;
    strategy: number;
  };
}
