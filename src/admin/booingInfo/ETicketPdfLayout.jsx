import React from "react";
import { Box, Typography, Table, TableHead, TableBody, TableRow, TableCell } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import BadgeIcon from "@mui/icons-material/Badge";
import ComputerIcon from "@mui/icons-material/Computer";
import LuggageIcon from "@mui/icons-material/Luggage";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import FlightIcon from "@mui/icons-material/Flight";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    const day = d.getDate();
    const month = d.toLocaleString("en-US", { month: "short" });
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return "N/A";
  }
};

const formatTime = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  } catch {
    return "N/A";
  }
};

const formatDayShort = (dateString) => {
  if (!dateString) return "";
  try {
    return new Date(dateString).toLocaleString("en-US", { weekday: "short" });
  } catch {
    return "";
  }
};

const formatNumber = (num) => {
  if (num === undefined || num === null) return "0.00";
  const n = parseFloat(num);
  return Number.isNaN(n) ? "0.00" : n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const LIGHT_BLUE_BG = "#E6F0F6";
const LIGHT_BLUE_DARKER = "#D0E4EE";
const DARK_BLUE = "#0F2F56";
const ACCENT_BLUE = "#1976D2";
const LIGHT_ACCENT = "#2CCEE4";
const TEXT_DARK = "#374151";
const GREY_TEXT = "#6B7280";

const ETicketPdfLayout = ({
  data,
  agencyName = "IONTRIP & TRAVEL LTD.",
  agencyAddress = "44A, PURANA PALTAN, DHAKA-1000",
  binNumber = "002347706",
  emergencyContact = "8801813304444",
  showFareSummary = true,
}) => {
  if (!data) return null;

  const segments = data?.segments || {};
  const goSegments = segments?.go || [];
  const backSegments = segments?.back || [];
  const allSegments = [...goSegments, ...backSegments];
  const travellers = data?.travellers || [];
  const pricebreakdown = data?.pricebreakdown || [];
  const currency = data?.farecurrency || "BDT";
  const bookingId = data?.bookingId || "N/A";
  const airlinePNR = data?.airlinePNR || data?.gdsPNR || "N/A";
  const status = (data?.status || "CONFIRMED").toUpperCase().replace("BOOKED", "CONFIRMED");
  const confirmedAt = data?.createdAt || data?.created_at || data?.lastTicketTime;
  const cabinClass = data?.cabinClass || data?.class || "Economy";

  const totalBaseFare = pricebreakdown.reduce(
    (s, i) => s + parseFloat(i.BaseFare || 0) * parseFloat(i.PaxCount || 1),
    0
  );
  const totalTax = pricebreakdown.reduce(
    (s, i) => s + parseFloat(i.Tax || 0) * parseFloat(i.PaxCount || 1),
    0
  );
  const grandTotal = parseFloat(data?.netPrice ?? data?.clientFare ?? 0) || totalBaseFare + totalTax;
  const aitVat = parseFloat(data?.aitVat ?? data?.ait ?? data?.vat ?? 0);
  const extraBaggage = parseFloat(data?.extraBaggage ?? data?.extraBaggageMealSeat ?? 0);
  const bundleCost = parseFloat(data?.bundleCost ?? 0);

  const getPaxTypeLabel = (v) => {
    const u = String(v || "").toUpperCase();
    if (["ADT", "ADULT"].includes(u)) return "ADULT";
    if (["CHD", "CHILD"].includes(u)) return "CHILD";
    if (["INF", "INFANT"].includes(u)) return "INFANT";
    return v || "ADULT";
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 720,
        margin: "0 auto",
        bgcolor: "#FFFFFF",
        color: "#111827",
        fontFamily: "Arial, Helvetica, sans-serif",
        p: 3,
        "& *": { boxSizing: "border-box" },
      }}
    >
      {/* Header design: Logo in white box, Company, Emergency Contact */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 2,
          pb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
          {/* Logo: ionTrip in white rounded rectangle with shadow */}
          <Box
            sx={{
              px: 1.5,
              py: 1,
              borderRadius: "6px",
              bgcolor: "#FFFFFF",
              boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
              border: "1px solid #E8EEF2",
            }}
          >
            <Typography component="span" sx={{ fontSize: 20, fontWeight: 800, color: LIGHT_ACCENT, display: "inline" }}>
              ion
            </Typography>
            <Typography component="span" sx={{ fontSize: 20, fontWeight: 800, color: DARK_BLUE, display: "inline", ml: 0.25 }}>
              Trip
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: TEXT_DARK, letterSpacing: 0.5 }}>
              {agencyName}
            </Typography>
            <Typography sx={{ fontSize: 11, color: GREY_TEXT }}>{agencyAddress}</Typography>
            <Typography sx={{ fontSize: 10, color: GREY_TEXT }}>BIN No: {binNumber}</Typography>
          </Box>
        </Box>
        <Box sx={{ textAlign: "right" }}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <PersonIcon sx={{ fontSize: 28, color: GREY_TEXT, mb: 0.25 }} />
            <Typography sx={{ fontSize: 10, color: TEXT_DARK }}>Emergency Contact</Typography>
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: TEXT_DARK }}>{emergencyContact}</Typography>
          </Box>
        </Box>
      </Box>

      {/* Airline PNR, BookingId | CONFIRMED, date */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1,
          py: 1.5,
          borderBottom: "1px solid #D1D5DB",
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 11, color: TEXT_DARK }}>Airline PNR: {airlinePNR}</Typography>
          <Typography sx={{ fontSize: 11, color: TEXT_DARK }}>BookingId: {bookingId}</Typography>
        </Box>
        <Box sx={{ textAlign: "right" }}>
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#059669" }}>{status}</Typography>
          <Typography sx={{ fontSize: 11, color: TEXT_DARK }}>
            {formatDate(confirmedAt)} {formatTime(confirmedAt)}
          </Typography>
        </Box>
      </Box>

      {/* Passenger Information - heading in light blue band, table below */}
      <Box sx={{ mb: 2.5 }}>
        <Box
          sx={{
            backgroundColor: LIGHT_BLUE_BG,
            py: 1,
            px: 2,
            mb: 0,
          }}
        >
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: TEXT_DARK, textAlign: "center" }}>
            Passenger Information
          </Typography>
        </Box>
        <Table size="small" sx={{ "& .MuiTableCell-root": { borderColor: "#D1D5DB" } }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: LIGHT_BLUE_DARKER }}>
              <TableCell sx={{ fontSize: 11, fontWeight: 700, color: TEXT_DARK, py: 1, px: 1.5, borderBottom: "1px solid #B0C4D4" }}>
                Name
              </TableCell>
              <TableCell sx={{ fontSize: 11, fontWeight: 700, color: TEXT_DARK, py: 1, px: 1.5, borderBottom: "1px solid #B0C4D4" }}>
                Type
              </TableCell>
              <TableCell sx={{ fontSize: 11, fontWeight: 700, color: TEXT_DARK, py: 1, px: 1.5, borderBottom: "1px solid #B0C4D4" }}>
                E-Ticket No
              </TableCell>
              <TableCell sx={{ fontSize: 11, fontWeight: 700, color: TEXT_DARK, py: 1, px: 1.5, borderBottom: "1px solid #B0C4D4" }}>
                Check-in Baggage
              </TableCell>
              <TableCell sx={{ fontSize: 11, fontWeight: 700, color: TEXT_DARK, py: 1, px: 1.5, borderBottom: "1px solid #B0C4D4" }}>
                Cabin Baggage
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {travellers.length > 0 ? (
              travellers.map((pax, idx) => {
                const pb = pricebreakdown[idx] || pricebreakdown[0];
                const paxType = getPaxTypeLabel(pb?.PaxType);
                const eTicket = pax?.eTicketNumber || pax?.ticketNumber || data?.eTicketNumber || "—";
                const checkInBag = pb?.CheckInBags || allSegments[0]?.bags || "—";
                const cabinBag = pb?.CabinBags || "7Kg";
                const name = [pax.title, pax.firstName, pax.lastName].filter(Boolean).join(" ") || "—";
                return (
                  <TableRow key={idx}>
                    <TableCell sx={{ fontSize: 11, color: TEXT_DARK, py: 1, px: 1.5, borderBottom: "1px solid #E5E7EB", bgcolor: "#fff" }}>
                      {name}
                    </TableCell>
                    <TableCell sx={{ fontSize: 11, color: TEXT_DARK, py: 1, px: 1.5, borderBottom: "1px solid #E5E7EB", bgcolor: "#fff" }}>
                      {paxType}
                    </TableCell>
                    <TableCell sx={{ fontSize: 11, color: TEXT_DARK, py: 1, px: 1.5, borderBottom: "1px solid #E5E7EB", bgcolor: "#fff" }}>
                      {eTicket}
                    </TableCell>
                    <TableCell sx={{ fontSize: 11, color: TEXT_DARK, py: 1, px: 1.5, borderBottom: "1px solid #E5E7EB", bgcolor: "#fff" }}>
                      {checkInBag}
                    </TableCell>
                    <TableCell sx={{ fontSize: 11, color: TEXT_DARK, py: 1, px: 1.5, borderBottom: "1px solid #E5E7EB", bgcolor: "#fff" }}>
                      {cabinBag}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell sx={{ fontSize: 11, color: GREY_TEXT, py: 2, px: 1.5 }} colSpan={5}>
                  No passenger data
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      <Box sx={{ borderBottom: "1px solid #D1D5DB", my: 2 }} />

      {/* Flight Itinerary - heading in light blue band */}
      <Box
        sx={{
          backgroundColor: LIGHT_BLUE_BG,
          py: 1,
          px: 2,
          mb: 1.5,
        }}
      >
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: TEXT_DARK, textAlign: "center" }}>
          Flight Itinerary
        </Typography>
      </Box>

      {allSegments.map((seg, idx) => {
        const dep = seg.departureAirport || seg.departure || "—";
        const arr = seg.arrivalAirport || seg.arrival || "—";
        const route = `${dep} - ${arr}`;
        const dateStr = formatDate(seg.departureTime);
        const airline = seg.marketingcareerName || seg.marketingcareer || "—";
        const flightNum = seg.marketingflight
          ? `${seg.marketingcareer || ""}-${seg.marketingflight}`
          : seg.marketingcareer || "—";
        const aircraft = seg.aircraft || seg.aircraftType || "";
        const depCity = seg.departureCity || dep;
        const arrCity = seg.arrivalCity || arr;
        const depAirport = seg.departureAirportName || seg.departureAirport || "";
        const arrAirport = seg.arrivalAirportName || seg.arrivalAirport || "";
        const duration = seg.flightduration || seg.duration || "—";
        const distance = seg.distance ? `${seg.distance} km` : "";

        return (
          <Box
            key={idx}
            sx={{
              mb: 2.5,
              border: "1px solid #E0E0E0",
              borderRadius: 0,
              overflow: "hidden",
            }}
          >
            {/* Segment header bar */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 1.5,
                py: 1,
                backgroundColor: LIGHT_BLUE_BG,
                borderBottom: "1px solid #BBDEFB",
              }}
            >
              <ChevronRightIcon sx={{ fontSize: 18, color: ACCENT_BLUE }} />
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#111827" }}>{route}</Typography>
              <Box sx={{ width: "1px", height: 14, bgcolor: "#90CAF9", mx: 1 }} />
              <Typography sx={{ fontSize: 11, color: "#111827" }}>{dateStr}</Typography>
              <Box sx={{ width: "1px", height: 14, bgcolor: "#90CAF9", mx: 1 }} />
              <Typography sx={{ fontSize: 11, color: "#111827" }}>Non Stop</Typography>
              <Box sx={{ width: "1px", height: 14, bgcolor: "#90CAF9", mx: 1 }} />
              <Typography sx={{ fontSize: 11, color: "#111827" }}>{seg.class || cabinClass} Class</Typography>
            </Box>
            <Box sx={{ px: 1.5, py: 1 }}>
              <Typography sx={{ fontSize: 11, color: GREY_TEXT, mb: 1.5 }}>
                {airline} | {flightNum} {aircraft ? `| ${aircraft}` : ""}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, flexWrap: "wrap" }}>
                <Box sx={{ flex: "1 1 180px", minWidth: 0 }}>
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                    <Box
                      sx={{
                        width: 22,
                        height: 22,
                        minWidth: 22,
                        borderRadius: "50%",
                        bgcolor: "#E53935",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mt: 0.25,
                      }}
                    >
                      <FlightTakeoffIcon sx={{ fontSize: 12, color: "#fff" }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 12, fontWeight: 600, color: TEXT_DARK }}>
                        {depCity} ({dep})
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: TEXT_DARK }}>
                        {formatDayShort(seg.departureTime)} {formatDate(seg.departureTime)}, {formatTime(seg.departureTime)}
                      </Typography>
                      <Typography sx={{ fontSize: 10, color: GREY_TEXT }}>{depAirport}</Typography>
                      <Typography sx={{ fontSize: 10, color: GREY_TEXT }}>Terminal: {seg.departureTerminal || "—"}</Typography>
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 70, py: 0.5 }}>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      bgcolor: "#E0E0E0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 0.5,
                    }}
                  >
                    <FlightIcon sx={{ fontSize: 14, color: "#757575" }} />
                  </Box>
                  <Typography sx={{ fontSize: 10, color: GREY_TEXT }}>{duration}</Typography>
                  <Typography sx={{ fontSize: 10, color: GREY_TEXT }}>{distance}</Typography>
                </Box>
                <Box sx={{ flex: "1 1 180px", minWidth: 0, textAlign: "right" }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: TEXT_DARK }}>
                    {arrCity} ({arr})
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: TEXT_DARK }}>
                    {formatDayShort(seg.arrivalTime)} {formatDate(seg.arrivalTime)}, {formatTime(seg.arrivalTime)}
                  </Typography>
                  <Typography sx={{ fontSize: 10, color: GREY_TEXT }}>{arrAirport}</Typography>
                  <Typography sx={{ fontSize: 10, color: GREY_TEXT }}>Terminal: {seg.arrivalTerminal || "—"}</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        );
      })}

      <Box sx={{ borderBottom: "1px solid #E0E0E0", my: 2 }} />

      {/* Fare Summary - heading in light blue band */}
      {showFareSummary && (
        <Box sx={{ mb: 2.5 }}>
          <Box
            sx={{
              backgroundColor: LIGHT_BLUE_BG,
              py: 1,
              px: 2,
              mb: 0,
            }}
          >
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: TEXT_DARK, textAlign: "center" }}>
              Fare Summary
            </Typography>
          </Box>
          <Table size="small" sx={{ "& .MuiTableCell-root": { borderColor: "#D1D5DB" } }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: LIGHT_BLUE_DARKER }}>
                <TableCell sx={{ fontSize: 11, fontWeight: 700, color: TEXT_DARK, py: 1, px: 1.5, borderBottom: "1px solid #B0C4D4" }}>
                  Passenger Type
                </TableCell>
                <TableCell sx={{ fontSize: 11, fontWeight: 700, color: TEXT_DARK, py: 1, px: 1.5, textAlign: "right", borderBottom: "1px solid #B0C4D4" }}>
                  Base Fare
                </TableCell>
                <TableCell sx={{ fontSize: 11, fontWeight: 700, color: TEXT_DARK, py: 1, px: 1.5, textAlign: "right", borderBottom: "1px solid #B0C4D4" }}>
                  Taxes
                </TableCell>
                <TableCell sx={{ fontSize: 11, fontWeight: 700, color: TEXT_DARK, py: 1, px: 1.5, textAlign: "right", borderBottom: "1px solid #B0C4D4" }}>
                  Total Pax
                </TableCell>
                <TableCell sx={{ fontSize: 11, fontWeight: 700, color: TEXT_DARK, py: 1, px: 1.5, textAlign: "right", borderBottom: "1px solid #B0C4D4" }}>
                  Total Fare
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pricebreakdown.length === 0 ? (
                <TableRow>
                  <TableCell sx={{ fontSize: 11, color: GREY_TEXT, py: 2 }} colSpan={5}>
                    No fare data
                  </TableCell>
                </TableRow>
              ) : (
                pricebreakdown.map((item, i) => {
                  const paxCount = parseInt(item.PaxCount || 1, 10);
                  const base = parseFloat(item.BaseFare || 0) * paxCount;
                  const tax = parseFloat(item.Tax || 0) * paxCount;
                  const total = base + tax;
                  return (
                    <TableRow key={i}>
                      <TableCell sx={{ fontSize: 11, color: TEXT_DARK, py: 1, px: 1.5, borderBottom: "1px solid #E5E7EB", bgcolor: "#fff" }}>
                        {getPaxTypeLabel(item.PaxType)}
                      </TableCell>
                      <TableCell sx={{ fontSize: 11, color: TEXT_DARK, py: 1, px: 1.5, textAlign: "right", borderBottom: "1px solid #E5E7EB", bgcolor: "#fff" }}>
                        {formatNumber(base)}
                      </TableCell>
                      <TableCell sx={{ fontSize: 11, color: TEXT_DARK, py: 1, px: 1.5, textAlign: "right", borderBottom: "1px solid #E5E7EB", bgcolor: "#fff" }}>
                        {formatNumber(tax)}
                      </TableCell>
                      <TableCell sx={{ fontSize: 11, color: TEXT_DARK, py: 1, px: 1.5, textAlign: "right", borderBottom: "1px solid #E5E7EB", bgcolor: "#fff" }}>
                        {paxCount}
                      </TableCell>
                      <TableCell sx={{ fontSize: 11, color: TEXT_DARK, py: 1, px: 1.5, textAlign: "right", borderBottom: "1px solid #E5E7EB", bgcolor: "#fff" }}>
                        {formatNumber(total)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.5, mt: 1.5 }}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Typography sx={{ fontSize: 11, color: TEXT_DARK }}>AIT & VAT</Typography>
              <Typography sx={{ fontSize: 11, color: TEXT_DARK, minWidth: 90, textAlign: "right" }}>{formatNumber(aitVat)} {currency}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Typography sx={{ fontSize: 11, color: TEXT_DARK }}>Extra Baggage/Meal/Seat</Typography>
              <Typography sx={{ fontSize: 11, color: TEXT_DARK, minWidth: 90, textAlign: "right" }}>{formatNumber(extraBaggage)} {currency}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Typography sx={{ fontSize: 11, color: TEXT_DARK }}>Bundle Cost</Typography>
              <Typography sx={{ fontSize: 11, color: TEXT_DARK, minWidth: 90, textAlign: "right" }}>{formatNumber(bundleCost)} {currency}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "baseline", gap: 2, mt: 1, pt: 1, borderTop: "1px solid #E5E7EB" }}>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: TEXT_DARK }}>Grand Total</Typography>
              <Typography sx={{ fontSize: 18, fontWeight: 700, color: TEXT_DARK, minWidth: 120, textAlign: "right" }}>
                {formatNumber(grandTotal)} {currency}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      <Box sx={{ borderBottom: "1px solid #D1D5DB", my: 2 }} />

      {/* Reminders */}
      <Box sx={{ mb: 2.5 }}>
        <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#111827", mb: 1.5 }}>
          Reminders:
        </Typography>
        {[
          {
            icon: FlightTakeoffIcon,
            title: "Flight Status",
            text: "Before your flight, please check your update flight status by inputting airline PNR on the airline website or by calling the airline's customer support.",
          },
          {
            icon: BadgeIcon,
            title: "Government ID",
            text: "Please carry a government issued photo ID card with your e-ticket for verification during check-in.",
          },
          {
            icon: ComputerIcon,
            title: "Online Check-in",
            text: "Airline website usually have online check-in available which can be availed in requirement.",
          },
          {
            icon: LuggageIcon,
            title: "Baggage Drop",
            text: "Please ensure you arrive at the Check-in Bag Drop counter before it closes for document verification and to check in your baggage.",
          },
          {
            icon: ExitToAppIcon,
            title: "Emergency Exit",
            text: "Passengers occupying seats in the emergency exit row are required to adhere to safety regulations and fulfill necessary requirements.",
          },
        ].map((item, idx) => (
          <Box key={idx} sx={{ display: "flex", gap: 1.5, mb: 1.25, alignItems: "flex-start" }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                minWidth: 32,
                borderRadius: "4px",
                bgcolor: "#E0E0E0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <item.icon sx={{ fontSize: 18, color: "#757575" }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#111827" }}>{item.title}:</Typography>
              <Typography sx={{ fontSize: 11, color: TEXT_DARK, lineHeight: 1.5 }}>{item.text}</Typography>
            </Box>
          </Box>
        ))}
      </Box>

      <Box sx={{ borderBottom: "1px solid #D1D5DB", my: 2 }} />

      {/* Important Information */}
      <Box sx={{ mb: 0 }}>
        <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#111827", mb: 1 }}>
          Important Information:
        </Typography>
        <Typography sx={{ fontSize: 11, color: TEXT_DARK, lineHeight: 1.6 }}>
          This electronic ticket receipt / itinerary serves as your documentation for your electronic ticket and is an integral part of your contract of carriage. Your electronic ticket is securely stored in the airline's computer reservation system. You may be required to present this receipt when entering the airport or to demonstrate return or onward travel to customs and immigration officials.
        </Typography>
        <Typography sx={{ fontSize: 11, color: TEXT_DARK, lineHeight: 1.6, mt: 1.5 }}>
          We advise you to complete the check-in process 2-3 hours before your flight's departure time. Boarding typically commences at least 35 minutes prior to the scheduled departure, with gates closing 15 minutes before departure. Please consult the departure airport for any regulations concerning the transportation of liquids, aerosols, and gels in your hand baggage.
        </Typography>
      </Box>
    </Box>
  );
};

export default ETicketPdfLayout;
