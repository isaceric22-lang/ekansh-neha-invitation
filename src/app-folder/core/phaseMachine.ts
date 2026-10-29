export type Phase = "idle" | "folder-open";

export type FolderState = {
  phase: Phase;
};

export type FolderAction = { type: "openFolder" } | { type: "closeFolder" };

export const INITIAL_STATE: FolderState = { phase: "idle" };

export function reduce(state: FolderState, action: FolderAction): FolderState {
  switch (action.type) {
    case "openFolder":
      return state.phase === "idle"
        ? { ...state, phase: "folder-open" }
        : state;
    case "closeFolder":
      return state.phase === "folder-open"
        ? { ...state, phase: "idle" }
        : state;
  }
}

export const selectors = {
  isShellOpen(s: FolderState): boolean {
    return s.phase !== "idle";
  },
};
