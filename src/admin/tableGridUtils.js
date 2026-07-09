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

/** Fixed pixel columns — header and body rows stay aligned (use with overflow-x: auto). */
export function fixedGridTemplateFromColumns(columns) {
  if (!columns?.length) return "";
  return columns
    .map((col) => {
      const raw = col?.width ?? "80px";
      if (typeof raw === "number") return `${raw}px`;
      const trimmed = String(raw).trim();
      return trimmed.endsWith("px") ? trimmed : `${trimmed}px`;
    })
    .join(" ");
}

export function tableMinWidthFromColumns(columns) {
  if (!columns?.length) return 0;
  return columns.reduce((sum, col) => {
    const raw = col?.width ?? "80px";
    const w =
      typeof raw === "number"
        ? raw
        : parseInt(String(raw).replace(/px/gi, "").trim(), 10) || 80;
    return sum + w;
  }, 0);
}
