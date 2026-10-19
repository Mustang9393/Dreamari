import { redirect } from "next/navigation";

// DEMO-ONLY: the lab opens on Software Engineer (SOC 15-1252, the O*NET
// page Joshua linked).
export default function OutlookLabIndex() {
  redirect("/outlook-lab/software-engineer");
}
