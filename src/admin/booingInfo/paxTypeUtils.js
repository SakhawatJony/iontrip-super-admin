export function parsePaxType(value) {
  const raw = String(value || "").toUpperCase().replace(/_/g, " ").trim();
  const compact = raw.replace(/\s+/g, "");
  if (["ADT", "ADULT"].includes(raw) || compact === "A") return { type: "Adult", code: "ADULT" };
  if (
    ["CHD", "CHILD", "CDH", "CNN"].includes(raw) ||
    /^CHD\d*$/.test(compact) ||
    /^C\d*$/.test(compact)
  ) {
    return { type: "Child", code: "CHILD" };
  }
  if (
    ["INF", "INFT", "INFANT", "HELD INFANT"].includes(raw) ||
    /^INF\d*$/.test(compact) ||
    /^I\d+$/.test(compact)
  ) {
    return { type: "Infant", code: "INFANT" };
  }
  if (!raw) return { type: "Adult", code: "ADULT" };
  return {
    type: raw.charAt(0) + raw.slice(1).toLowerCase(),
    code: raw,
  };
}

export function resolveTravellerPaxType(traveller, index = 0, pricebreakdown = []) {
  return (
    traveller?.passengerType ||
    traveller?.nameReference ||
    traveller?.paxType ||
    traveller?.PaxType ||
    pricebreakdown[index]?.PaxType ||
    "ADULT"
  );
}

export function countTravellersByPaxCode(travellers = [], pricebreakdown = []) {
  const counts = {};
  travellers.forEach((traveller, index) => {
    const raw = resolveTravellerPaxType(traveller, index, pricebreakdown);
    const { code } = parsePaxType(raw);
    counts[code] = (counts[code] || 0) + 1;
  });
  return counts;
}

export function getPaxCountForFareRow(item, travellers = [], pricebreakdown = []) {
  if (!Array.isArray(travellers) || travellers.length === 0) {
    return parseInt(item?.PaxCount || 1, 10);
  }

  const rowCode = parsePaxType(item?.PaxType).code;
  const counts = countTravellersByPaxCode(travellers, pricebreakdown);
  const matched = counts[rowCode] || 0;
  if (matched > 0) return matched;

  if (pricebreakdown.length === 1) return travellers.length;

  return parseInt(item?.PaxCount || 1, 10);
}

export function getTotalTravellerCount(travellers = [], pricebreakdown = []) {
  if (Array.isArray(travellers) && travellers.length > 0) {
    return travellers.length;
  }
  return pricebreakdown.reduce((sum, item) => sum + parseInt(item.PaxCount || 1, 10), 0);
}

export function getPaxTypeSortOrder(value) {
  const { code } = parsePaxType(value);
  if (code === "ADULT") return 0;
  if (code === "CHILD") return 1;
  if (code === "INFANT") return 2;
  return 3;
}

export function sortTravellersByPaxType(travellers = [], pricebreakdown = []) {
  return [...travellers]
    .map((traveller, index) => ({
      traveller,
      index,
      paxType: resolveTravellerPaxType(traveller, index, pricebreakdown),
    }))
    .sort(
      (a, b) =>
        getPaxTypeSortOrder(a.paxType) - getPaxTypeSortOrder(b.paxType) || a.index - b.index,
    );
}
