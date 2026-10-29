import { createContext } from "react";
import type { MusicApi } from "./types";

export const MusicContext = createContext<MusicApi | null>(null);
