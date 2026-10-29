import { useContext } from "react";
import { MusicContext } from "./context";
import type { MusicApi } from "./types";

export function useMusic(): MusicApi {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error("useMusic must be used within <MusicProvider>");
  return ctx;
}
