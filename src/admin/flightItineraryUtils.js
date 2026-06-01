/** ISO-8601 duration (e.g. PT14H35M) → "14h 35m" */
export const formatIso8601Duration = (pt) => {
  if (pt == null || pt === "") return "";
  if (typeof pt !== "string") return String(pt);
  const trimmed = pt.trim();
  if (!/^PT/i.test(trimmed)) return trimmed;

  const dMatch = trimmed.match(/(\d+)D/i);
  const hMatch = trimmed.match(/(\d+)H/i);
  const mMatch = trimmed.match(/(\d+)M/i);

  let hours = hMatch ? parseInt(hMatch[1], 10) : 0;
  const minutes = mMatch ? parseInt(mMatch[1], 10) : 0;

  if (dMatch) hours += parseInt(dMatch[1], 10) * 24;

  if (hours && minutes) return `${hours}h ${minutes}m`;
  if (hours) return `${hours}h`;
  if (minutes) return `${minutes}m`;
  return trimmed.replace(/^PT/i, "");
};

export const formatDisplayDuration = (value) => formatIso8601Duration(value);

const mapSierraFlightToRow = (f) => {
  const baggage = f.baggage;
  const bags =
    typeof baggage === "string"
      ? baggage
      : baggage && typeof baggage === "object"
        ? [baggage.checked || baggage.checkIn, baggage.cabin].filter(Boolean).join(" / ")
        : "";

  return {
    departure: f.departure?.iataCode,
    arrival: f.arrival?.iataCode,
    departureAirport: f.departure?.airport,
    arrivalAirport: f.arrival?.airport,
    departureLocation: f.departure?.location,
    arrivalLocation: f.arrival?.location,
    departureTerminal: f.departure?.terminal,
    arrivalTerminal: f.arrival?.terminal,
    departureTime: f.departure?.at,
    arrivalTime: f.arrival?.at,
    marketingcareer: f.marketingCarrier,
    marketingflight: f.marketingFlight,
    marketingCarrier: f.marketingCarrier,
    marketingFlight: f.marketingFlight,
    marketingcareerName: f.marketingCarrierName,
    operatingCarrierName: f.operatingCarrierName,
    duration: f.duration,
    flightduration: f.duration,
    class: f.cabin,
    cabin: f.cabin,
    aircraft: f.aircraft,
    bags,
    baggage,
    transit: f.transit,
  };
};

const mapSierraLegToRows = (leg) => {
  const flights = Array.isArray(leg?.flights) ? leg.flights : [];
  return flights.map(mapSierraFlightToRow);
};

const isSierraLegSegmentArray = (segs) =>
  Array.isArray(segs) &&
  segs.length > 0 &&
  (segs[0]?.summary != null || Array.isArray(segs[0]?.flights));

const resolveSierraLeg = (segs, legNumber) => {
  if (!Array.isArray(segs) || segs.length === 0) return null;
  const byLeg = segs.find((l) => Number(l?.leg) === legNumber);
  if (byLeg) return byLeg;
  return segs[legNumber - 1] ?? null;
};

export const isRoundTripBooking = (data) => {
  const tripType = String(data?.triptype || "").toLowerCase();
  if (tripType === "roundtrip" || tripType === "roundway") return true;
  if (Array.isArray(data?.segments?.back) && data.segments.back.length) return true;
  const segs = data?.segments;
  if (isSierraLegSegmentArray(segs) && segs.length >= 2) return true;
  return Boolean(data?.backdeparture && data?.backarrival);
};

export const resolveSierraLegSummary = (data, legNumber) => {
  const segs = data?.segments;
  if (!isSierraLegSegmentArray(segs)) return null;
  return resolveSierraLeg(segs, legNumber)?.summary ?? null;
};

/** Legacy `segments.go`, UI `segmentsUi.go`, or Sierra `segments[]` with `summary` / `flights`. */
export const resolveBookingGoSegments = (data) => {
  if (!data) return [];
  if (Array.isArray(data?.segmentsUi?.go) && data.segmentsUi.go.length) {
    return data.segmentsUi.go;
  }
  if (Array.isArray(data?.segments?.go) && data.segments.go.length) {
    return data.segments.go;
  }

  const segs = data?.segments;
  if (!Array.isArray(segs) || segs.length === 0) return [];

  if (isSierraLegSegmentArray(segs)) {
    if (isRoundTripBooking(data) && segs.length >= 2) {
      const outboundLeg = resolveSierraLeg(segs, 1);
      return outboundLeg ? mapSierraLegToRows(outboundLeg) : [];
    }
    return segs.flatMap(mapSierraLegToRows);
  }

  return segs;
};

/** Legacy `segments.back` or Sierra round-trip leg 2. */
export const resolveBookingBackSegments = (data) => {
  if (!data) return [];
  if (Array.isArray(data?.segmentsUi?.back) && data.segmentsUi.back.length) {
    return data.segmentsUi.back;
  }
  if (Array.isArray(data?.segments?.back) && data.segments.back.length) {
    return data.segments.back;
  }

  const segs = data?.segments;
  if (!isSierraLegSegmentArray(segs) || segs.length < 2 || !isRoundTripBooking(data)) {
    return [];
  }

  const returnLeg = resolveSierraLeg(segs, 2);
  return returnLeg ? mapSierraLegToRows(returnLeg) : [];
};

const pickBaggageValue = (...values) => {
  for (const v of values) {
    if (v == null) continue;
    const s = String(v).trim();
    if (s && !/^n\/?a$/i.test(s)) return s;
  }
  return "";
};

export const resolveBaggageAllowance = (segment = {}, priceRow = {}, data = {}) => {
  const baggage = segment?.baggage;
  let cabin = pickBaggageValue(
    baggage?.cabin,
    segment?.cabinBag,
    segment?.cabinBags,
    priceRow?.CabinBags,
    priceRow?.cabinBags,
    priceRow?.cabinBaggage,
    data?.cabinBaggage,
    data?.cabinBags
  );
  let checkin = pickBaggageValue(
    baggage?.checked,
    baggage?.checkIn,
    segment?.checkInBags,
    priceRow?.CheckInBags,
    priceRow?.checkInBags,
    priceRow?.checkedBaggage,
    data?.checkedBaggage,
    data?.checkInBags
  );

  const bagsRaw = segment?.bags;
  if (bagsRaw && typeof bagsRaw === "string") {
    if (bagsRaw.includes(" / ")) {
      const [left, right] = bagsRaw.split(" / ").map((s) => s.trim());
      checkin = pickBaggageValue(left, checkin);
      cabin = pickBaggageValue(right, cabin);
    } else if (!checkin) {
      checkin = bagsRaw.trim();
    }
  }

  return {
    cabin: cabin || "N/A",
    checkin: checkin || "N/A",
  };
};

/** Route-level baggage rows for a passenger (Sierra + legacy shapes). */
export const resolvePassengerBaggageRows = (data, priceRow = {}) => {
  const go = resolveBookingGoSegments(data);
  const back = resolveBookingBackSegments(data);
  const mapped = [...go, ...back];

  if (mapped.length > 0) {
    return mapped.map((segment) => ({
      route: `${segment.departure || ""}-${segment.arrival || ""}`,
      ...resolveBaggageAllowance(segment, priceRow, data),
    }));
  }

  const sierraLegs = Array.isArray(data?.segments)
    ? data.segments.filter((leg) => leg?.summary || Array.isArray(leg?.flights))
    : [];

  if (sierraLegs.length > 0) {
    const rows = [];
    sierraLegs.forEach((leg) => {
      const flights = Array.isArray(leg?.flights) ? leg.flights : [];
      if (flights.length > 0) {
        flights.forEach((f) => {
          rows.push({
            route: `${f.departure?.iataCode || ""}-${f.arrival?.iataCode || ""}`,
            ...resolveBaggageAllowance({ baggage: f.baggage }, priceRow, data),
          });
        });
      } else if (leg?.summary) {
        rows.push({
          route: `${leg.summary.departure}-${leg.summary.arrival}`,
          ...resolveBaggageAllowance({}, priceRow, data),
        });
      }
    });
    if (rows.length) return rows;
  }

  return [
    {
      route: "N/A",
      ...resolveBaggageAllowance({}, priceRow, data),
    },
  ];
};

/** Unwrap nested booking payload from admin booking API responses. */
export const unwrapBookingResponse = (response) => {
  const payload = response?.data;
  if (!payload) return null;
  if (payload?.data && typeof payload.data === "object" && !Array.isArray(payload.data)) {
    return payload.data;
  }
  return payload;
};
