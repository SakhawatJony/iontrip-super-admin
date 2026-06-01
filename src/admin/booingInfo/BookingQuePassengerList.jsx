import React from "react";
import { Box, Typography, Grid } from "@mui/material";
import { BQ, bqCardSx, bqLabelSx, bqValueSx } from "./bookingQueTheme.js";
import { BqAccentTitle } from "./bookingQueUi.jsx";
import { resolvePassengerBaggageRows } from "../flightItineraryUtils";

const getInitials = (traveller) => {
  const f = (traveller?.firstName || "").charAt(0);
  const l = (traveller?.lastName || "").charAt(0);
  return (f + l).toUpperCase() || "?";
};

const BookingQuePassengerList = ({ data }) => {
  const travellers = data?.travellers || [];
  const pricebreakdown = data?.pricebreakdown || [];
  const baggage = resolvePassengerBaggageRows(data, pricebreakdown[0] || {});

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return dateString;
    }
  };

  const getTitle = (gender, title) => {
    if (title) return String(title).toUpperCase();
    if (gender === "MALE") return "MR";
    if (gender === "FEMALE") return "MRS";
    return "MR";
  };

  const getPaxType = (index) => pricebreakdown[index]?.PaxType || "ADULT";
  const ticketNo = data?.airlinePNR || data?.gdsPNR || "N/A";

  return (
    <Box sx={{ ...bqCardSx, p: 1.75 }}>
      <BqAccentTitle
        title="Passengers & Baggage"
        right={
          <Typography sx={{ fontSize: 11, color: BQ.muted, fontWeight: 500 }}>
            {travellers.length} traveller{travellers.length === 1 ? "" : "s"}
          </Typography>
        }
      />

      {travellers.length === 0 ? (
        <Typography sx={{ fontSize: 12, color: BQ.muted, textAlign: "center", py: 2 }}>
          No passenger data available
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
          {travellers.map((traveller, index) => {
            const fullName = [getTitle(traveller.gender, traveller.title), traveller.firstName, traveller.lastName]
              .filter(Boolean)
              .join(" ");

            const detailFields = [
              { label: "Date of Birth", value: formatDate(traveller.dateOfBirth) },
              { label: "Passport No", value: traveller.passportNumber || "N/A" },
              { label: "Passport Expiry", value: formatDate(traveller.passportExpireDate) },
              { label: "Nationality", value: traveller.nationality || traveller.country || "N/A" },
              { label: "Email", value: traveller.email || data?.contactEmail || "N/A" },
              { label: "Phone", value: traveller.phone || traveller.mobile || data?.contactPhone || "N/A" },
            ];

            return (
              <Box
                key={index}
                sx={{
                  border: `1px solid ${BQ.border}`,
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    bgcolor: BQ.navy,
                    px: 1.5,
                    py: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      bgcolor: "rgba(255,255,255,0.2)",
                      color: "#fff",
                      border: "1px solid rgba(255,255,255,0.35)",
                      fontWeight: 700,
                      fontSize: 11,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {getInitials(traveller)}
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#fff" }} noWrap>
                      {fullName}
                    </Typography>
                    <Typography sx={{ fontSize: 10, color: "rgba(255,255,255,0.78)" }}>
                      {getPaxType(index)} · Ticket {ticketNo}
                    </Typography>
                  </Box>
                </Box>

                <Grid container>
                  <Grid item xs={12} md={baggage.length > 0 ? 8 : 12} sx={{ p: 1.5 }}>
                    <Grid container spacing={1.25}>
                      {detailFields.map((f) => (
                        <Grid item xs={6} sm={4} key={f.label}>
                          <Typography sx={bqLabelSx}>{f.label}</Typography>
                          <Typography sx={{ ...bqValueSx, mt: 0.2 }} noWrap>
                            {f.value}
                          </Typography>
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>

                  {baggage.length > 0 ? (
                    <Grid
                      item
                      xs={12}
                      md={4}
                      sx={{
                        p: 1.5,
                        bgcolor: BQ.accentSoft,
                        borderLeft: { md: `1px solid ${BQ.border}` },
                        borderTop: { xs: `1px solid ${BQ.border}`, md: "none" },
                      }}
                    >
                      <Typography sx={{ fontSize: 10, fontWeight: 700, color: BQ.navy, mb: 0.75 }}>
                        Baggage allowance
                      </Typography>
                      {baggage.map((b, i) => (
                        <Box key={i} sx={{ mb: i < baggage.length - 1 ? 0.75 : 0 }}>
                          <Typography sx={{ fontSize: 10, fontWeight: 700, color: BQ.navy }}>
                            {b.route}
                          </Typography>
                          <Typography sx={{ fontSize: 10, color: BQ.muted }}>
                            Cabin <Box component="span" sx={{ color: BQ.actionBlue, fontWeight: 600 }}>{b.cabin}</Box>
                            {" · "}
                            Check-in <Box component="span" sx={{ color: BQ.actionBlue, fontWeight: 600 }}>{b.checkin}</Box>
                          </Typography>
                        </Box>
                      ))}
                    </Grid>
                  ) : null}
                </Grid>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default BookingQuePassengerList;
