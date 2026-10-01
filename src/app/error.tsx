"use client"; // Error boundaries must be Client Components

// The app's error boundary. Before 27 Sept 2026 a component that threw
// blanked the whole screen (ErrorReporter only logs); now any route shows a
// calm "Something went wrong" with Try again, which re-renders the segment.

import { useEffect } from "react";
import { ErrorView } from "@/components/app/states";
import "@/components/marketing/tokens.css";
import "@/components/app/app.css";

export default function ErrorPage({ error, unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main className="marketing-v2 themeable flex min-h-dvh items-center justify-center px-4" style={{ color: "var(--foreground)", background: "var(--background)", fontFamily: "var(--font-body)" }}>
      <div className="w-full max-w-[440px]">
        <ErrorView message="Something went wrong." onRetry={() => unstable_retry()} />
      </div>
    </main>
  );
}
