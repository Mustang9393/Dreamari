import { Bricolage_Grotesque } from "next/font/google";

// The Figma UI type styles (live variable pull): Display/H1/H2/Body are Bricolage
// Grotesque (ExtraBold/Bold/SemiBold); Montserrat covers only Body Secondary,
// Labels, and Captions — which the app layout already loads globally. This module
// gives the flow the Bricolage half of that pairing; weights match the pulled
// styles (600 Body, 700 H1/H2, 800 Display).
export const bricolage = Bricolage_Grotesque({ subsets: ["latin"], weight: ["600", "700", "800"] });
