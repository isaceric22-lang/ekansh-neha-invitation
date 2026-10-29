import { createContext } from "react";
import type { AppNavApi } from "./types";
import type { AppNavEnv } from "./env";

export type AppNavContextValue = AppNavApi & {
  /** Exposed so `useAppIcon` can measure through the same (possibly faked) env. */
  env: AppNavEnv;
};

export const AppNavContext = createContext<AppNavContextValue | null>(null);
