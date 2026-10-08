// True while a detail page is being shown inside the phone and tablet
// page sheet (peek.tsx, PageSheet). The page then leaves out its own chrome
// (backdrop, navigation bars, back link, the action layer) because the
// sheet and the screen under it already have them (8 Oct 2026, Chandu:
// "basically just take the full page view and turn it into a sheet that
// opens all the way").
import { createContext, useContext } from "react";

export const InSheet = createContext(false);
export const useInSheet = () => useContext(InSheet);
