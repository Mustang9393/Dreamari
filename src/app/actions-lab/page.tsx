import { redirect } from "next/navigation";

// DEMO-ONLY: the Career actions lab starts on its copy of Explore.
export default function ActionsLabPage() {
  redirect("/actions-lab/explore");
}
