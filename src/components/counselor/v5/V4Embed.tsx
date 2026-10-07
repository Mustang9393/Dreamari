"use client";

// A v4 screen inside v5 or v6, as v4 renders it (v4.css scopes its styles to
// [data-counselor-version="v4"] .v4-content). The embed drops v4's own page
// background and full-height root so it sits in the host page.

export function V4Embed({ children }: { children: React.ReactNode }) {
  return (
    <div className="v4-embed marketing-v2 themeable" data-counselor-version="v4">
      <div className="v4-content">{children}</div>
    </div>
  );
}
