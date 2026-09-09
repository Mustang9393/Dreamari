import type { Metadata } from "next";
import { ConnectExperience } from "@/components/connect/ConnectExperience";
import "@/components/marketing/tokens.css";
// dm-tap/dm-quiet/dm-link/dm-solid (the hover/focus affordances used all
// over Connect -- Ask Me rows, My Posts rows, Communities tiles, every
// dm-quiet icon button and dm-link text action) live in app.css. Connect
// never imported it, so none of those classes have ever done anything here
// -- found while chasing why rows with the class already on them still
// didn't react to hover (direct feedback, 9 Sept 2026: "every clickable
// surface/card should have a hover effect").
import "@/components/app/app.css";

export const metadata: Metadata = {
  title: "Connect · Dreamari",
  description: "Ask real people about careers you are exploring.",
};

// Connect — moderated career Q&A + post-event continuation. View state
// (home tab / board / event / thread) lives in the query string so it
// survives reload and share (?board=, ?event=, ?thread=, ?tab=), same
// pattern as Explore's ?tab=.
export default function ConnectPage() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <ConnectExperience />
    </>
  );
}
