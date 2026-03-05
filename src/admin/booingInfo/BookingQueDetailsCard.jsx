import React, { useState } from "react";
import { Box, Divider, Typography, Tab, Tabs } from "@mui/material";
import FlightIcon from "@mui/icons-material/Flight";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const BookingQueDetailsCard = ({ data }) => {
  const [tab, setTab] = useState(0);
  const [logoErrors, setLogoErrors] = useState({});
  
  // Format time from ISO string to HH:MM
  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    } catch {
      return "N/A";
    }
  };

  // Format date from ISO string to "DD MMM, YYYY"
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.toLocaleString("en-US", { month: "short" });
      const year = date.getFullYear();
      return `${day} ${month}, ${year}`;
    } catch {
      return "N/A";
    }
  };

  // Build segments array from API data
  const buildSegments = (segmentsArray) => {
    const processedSegments = [];
    
    segmentsArray.forEach((segment, index) => {
      const departTime = formatTime(segment.departureTime);
      const departDate = formatDate(segment.departureTime);
      const arriveTime = formatTime(segment.arrivalTime);
      const arriveDate = formatDate(segment.arrivalTime);
      const route = `${segment.departureAirport || segment.departure || "N/A"} to ${segment.arrivalAirport || segment.arrival || "N/A"}`;
      const airline = `${segment.marketingcareerName || segment.marketingcareer || "N/A"} - ${segment.marketingcareer || ""} ${segment.marketingflight || ""}`;
      const cabin = `${segment.class || data?.cabinClass || "ECONOMY"}`;
      const baggage = segment.bags || "N/A";
      const duration = segment.flightduration || "N/A";
      const layover = segment.transit && Object.keys(segment.transit).length > 0 
        ? `Stops ${Object.keys(segment.transit).length} / Layover ${segment.transit[Object.keys(segment.transit)[0]] || "N/A"}`
        : "Non-stop";
      const carrierCode = segment.marketingcareer || segment.carrierCode || "";

      processedSegments.push({
        departTime,
        departDate,
        arriveTime,
        arriveDate,
        route,
        airline,
        cabin,
        baggage,
        duration,
        layover,
        carrierCode,
        originalIndex: index,
      });
    });

    return processedSegments;
  };

  const goSegments = data?.segments?.go || [];
  const backSegments = data?.segments?.back || [];
  const processedGoSegments = buildSegments(goSegments);
  const processedBackSegments = buildSegments(backSegments);
  
  // Get departure and arrival airports for header
  const goDeparture = data?.godeparture || data?.segments?.go?.[0]?.departure || "N/A";
  const goArrival = data?.goarrival || data?.segments?.go?.[data?.segments?.go?.length - 1]?.arrival || "N/A";
  const backDeparture = data?.backdeparture || data?.segments?.back?.[0]?.departure;
  const backArrival = data?.backarrival || data?.segments?.back?.[data?.segments?.back?.length - 1]?.arrival;
  
  const isRoundTrip = data?.triptype === "roundtrip" || (backDeparture && backArrival);
  const goRoute = `${goDeparture} → ${goArrival}`;
  const backRoute = backDeparture && backArrival ? `${backDeparture} → ${backArrival}` : "";

  const currentSegments = tab === 0 ? processedGoSegments : processedBackSegments;

  return (
    <Box
      sx={{
        backgroundColor: "#FFFFFF",
        borderRadius: 1.5,
       
        overflow: "hidden",
      }}
    >
      {isRoundTrip ? (
        <Tabs
          value={tab}
          onChange={(e, v) => setTab(v)}
          variant="fullWidth"
          sx={{
            minHeight: 52,
            
            borderBottom: "2px solid #D9D9D9",
            "& .MuiTabs-indicator": {
              backgroundColor: "var(--primary-color)",
              height: 3,
            },
            "& .MuiTab-root": {
              borderRight: "2px solid #D9D9D9",
              minHeight: 52,
            },
            "& .MuiTab-root:last-of-type": {
              borderRight: "none",
            },
          }}
        >
          <Tab
            disableRipple
            sx={{ alignItems: "flex-start", textTransform: "none" }}
            label={
              <Box>
                <Typography fontSize={10} color="#6B7280">
                  Departure
                </Typography>
                <Typography fontSize={13} fontWeight={600} color="#111827">
                  {goRoute}
                </Typography>
              </Box>
            }
          />
          <Tab
            disableRipple
            sx={{ alignItems: "flex-start", textTransform: "none" }}
            label={
              <Box>
                <Typography fontSize={10} color="#6B7280">
                  Return
                </Typography>
                <Typography fontSize={13} fontWeight={600} color="#111827">
                  {backRoute}
                </Typography>
              </Box>
            }
          />
        </Tabs>
      ) : (
        <Box sx={{ px: 2, py: 1.5, borderBottom: "2px solid #D9D9D9" }}>
          <Typography fontSize={12} color="#94A3B8" fontWeight={600} mb={0.5}>
            Departure
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography fontSize={16} fontWeight={700} color="#0F172A">
              {goDeparture}
            </Typography>
            <ArrowForwardIcon sx={{ fontSize: 18, color: "#0F2F56" }} />
            <Typography fontSize={16} fontWeight={700} color="#0F172A">
              {goArrival}
            </Typography>
          </Box>
        </Box>
      )}

      <Box sx={{ px: 2, py: 2, display: "flex", flexDirection: "column", gap: 2 }}>
        {currentSegments.length === 0 ? (
          <Typography sx={{ fontSize: 14, color: "#6B7280", textAlign: "center", py: 2 }}>
            No flight segments available
          </Typography>
        ) : (
          currentSegments.map((segment, index) => {
            const logoCode = String(segment?.carrierCode || "").toUpperCase();
            const logoKey = `${logoCode}-${tab}-${index}`;
            const logoUrl = logoCode
              ? `https://tbbd-flight.s3.ap-southeast-1.amazonaws.com/airlines-logo/${logoCode}.png`
              : "";
            const hasLogo = Boolean(logoUrl) && !logoErrors[logoKey];

            return (
            <Box key={`${segment.departTime}-${index}`}>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  backgroundColor: hasLogo ? "#E6EEF7" : "#E11D48",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  overflow: "hidden",
                }}
              >
                {hasLogo ? (
                  <Box
                    component="img"
                    src={logoUrl}
                    alt={segment?.airline || "Airline"}
                    sx={{ width: 28, height: 28, objectFit: "contain" }}
                    onError={() =>
                      setLogoErrors((prev) => ({
                        ...prev,
                        [logoKey]: true,
                      }))
                    }
                  />
                ) : (
                  <FlightIcon sx={{ color: "#FFFFFF", fontSize: 18 }} />
                )}
              </Box>

              <Box sx={{ flex: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    mb: 0.5,
                  }}
                >
                  <Typography fontSize={14} fontWeight={700} color="#111827">
                    {segment.departTime}
                  </Typography>
                  <Typography fontSize={11} color="#94A3B8">
                    {segment.departDate}
                  </Typography>
                  <ArrowForwardIcon sx={{ fontSize: 16, color: "#94A3B8" }} />
                  <Typography fontSize={14} fontWeight={700} color="#111827">
                    {segment.arriveTime}
                  </Typography>
                  <Typography fontSize={11} color="#94A3B8">
                    {segment.arriveDate}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.4 }}>
                  <Typography fontSize={11} color="#6B7280">
                    {segment.route}
                  </Typography>
                  <Typography fontSize={11} color="#6B7280">
                    {segment.airline}
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                    <Typography fontSize={11} color="#6B7280">
                      {segment.cabin}
                    </Typography>
                    <Typography fontSize={11} color="#6B7280">
                      Baggage {segment.baggage}
                    </Typography>
                    <Typography fontSize={11} color="#0F172A">
                      Duration: {segment.duration}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: "#0F2F56",
                }}
              />
              <Typography fontSize={11} color="#0F172A" fontWeight={600}>
                {segment.layover}
              </Typography>
            </Box>

            {index < currentSegments.length - 1 && <Divider sx={{ mt: 2 }} />}
          </Box>
          );
          })
        )}
      </Box>
    </Box>
  );
};

export default BookingQueDetailsCard;
