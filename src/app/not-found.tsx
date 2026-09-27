import type { Metadata } from "next";
import { NotFoundView } from "@/components/app/states";
import "@/components/marketing/tokens.css";
import "@/components/app/app.css";

// Route-level 404 for any URL that doesn't exist (and any notFound() call).
// Same copy as Connect's ConnectNotFound, the one 404 built before.
export const metadata: Metadata = { title: "Not found · Dreamari" };

export default function NotFound() {
  return (
    <main className="marketing-v2 themeable flex min-h-dvh items-center justify-center px-4" style={{ color: "var(--foreground)", background: "var(--background)", fontFamily: "var(--font-body)" }}>
      <div className="w-full max-w-[440px]">
        <NotFoundView />
      </div>
    </main>
  );
}
