import { permanentRedirect } from "next/navigation";

// The A/B test is settled — the cinematic treatment IS /flow now. Old shared
// links to the B-variant URL land on the real flow.
export default function CinematicFlowPage() {
  permanentRedirect("/flow");
}
