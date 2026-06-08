/**
 * CSS grid template that fills the container width without horizontal scroll.
 * Uses each column's `width` (e.g. "120px") as a proportional fr weight.
 */
export function fluidGridTemplateFromColumns(columns) {
  if (!columns?.length) return "";
  return columns
    .map((col) => {
      const raw = col?.width ?? "80px";
      const w =
        typeof raw === "number"
          ? raw
          : parseInt(String(raw).replace(/px/gi, "").trim(), 10) || 80;
      return `minmax(0, ${w}fr)`;
    })
    .join(" ");
}

/** Grid columns keep a minimum width and grow to fit cell content (use with overflow-x: auto). */
export function scrollableGridTemplateFromColumns(columns) {
  if (!columns?.length) return "";
  return columns
    .map((col) => {
      const raw = col?.width ?? "80px";
      if (typeof raw === "number") return `minmax(${raw}px, max-content)`;
      const trimmed = String(raw).trim();
      const width = trimmed.endsWith("px") ? trimmed : `${trimmed}px`;
      return `minmax(${width}, max-content)`;
    })
    .join(" ");
}
