/** The page alone, printed on a Letter sheet (or saved as PDF). */
export function printDocumentPage(node: HTMLElement | null, title: string) {
  if (!node) return;
  const clone = node.cloneNode(true) as HTMLElement;
  const areas = node.querySelectorAll("textarea");
  clone.querySelectorAll("textarea").forEach((ta, i) => {
    const div = document.createElement("div");
    div.textContent = areas[i]?.value ?? "";
    div.setAttribute("style", `${ta.getAttribute("style") ?? ""}; white-space: pre-wrap; border: 0; padding: 0; height: auto;`);
    ta.parentElement?.classList.remove("-mx-[10px]");
    ta.replaceWith(div);
  });
  clone.querySelectorAll("[data-print-hide]").forEach((n) => n.remove());
  clone.querySelectorAll('[aria-label="Edit document text"]').forEach((n) => { (n as HTMLElement).style.border = "0"; });
  const styles = [...document.querySelectorAll('link[rel="stylesheet"], style')].map((n) => n.outerHTML).join("");
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden";
  document.body.appendChild(frame);
  const doc = frame.contentDocument;
  if (!doc) return;
  doc.open();
  doc.write(`<!doctype html><html><head><title>${title}</title>${styles}<style>@page{size:letter portrait;margin:0}html,body{margin:0;background:#fff}[data-doc-page]{min-height:11in!important}</style></head><body>${clone.outerHTML}</body></html>`);
  doc.close();
  const go = () => {
    frame.contentWindow?.focus();
    frame.contentWindow?.print();
    window.setTimeout(() => frame.remove(), 1000);
  };
  // Fonts and stylesheets load before printing, or the page prints bare.
  const fonts = (doc as Document & { fonts?: FontFaceSet }).fonts;
  window.setTimeout(() => { (fonts?.ready ?? Promise.resolve()).then(go); }, 350);
}

