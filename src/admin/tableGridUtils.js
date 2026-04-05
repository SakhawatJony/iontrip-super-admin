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
