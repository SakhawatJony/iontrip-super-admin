import React from "react";
import { Box, Typography, Grid } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const BookingQuePassengerList = ({ data }) => {
  const travellers = data?.travellers || [];
  const segments = data?.segments || {};
  const pricebreakdown = data?.pricebreakdown || [];

  // Format date from YYYY-MM-DD to DD-MM-YYYY
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

  // Get title from gender
  const getTitle = (gender) => {
    if (!gender) return "N/A";
    return gender === "MALE" ? "MR" : gender === "FEMALE" ? "MRS" : "MR";
  };

  // Build baggage array from segments
  const buildBaggageData = () => {
    const baggageData = [];
    const goSegments = segments?.go || [];
    const backSegments = segments?.back || [];

    // Process go segments
    goSegments.forEach((segment) => {
      const route = `${segment.departure || ""}-${segment.arrival || ""}`;
      const cabinBag = pricebreakdown[0]?.CabinBags || "7KG";
      const checkinBag = segment.bags || pricebreakdown[0]?.CheckInBags || "N/A";
      baggageData.push({ route, cabin: cabinBag, checkin: checkinBag });
    });

    // Process back segments
    backSegments.forEach((segment) => {
      const route = `${segment.departure || ""}-${segment.arrival || ""}`;
      const cabinBag = pricebreakdown[0]?.CabinBags || "7KG";
      const checkinBag = segment.bags || pricebreakdown[0]?.CheckInBags || "N/A";
      baggageData.push({ route, cabin: cabinBag, checkin: checkinBag });
    });

    return baggageData.length > 0 ? baggageData : [{ route: "N/A", cabin: "N/A", checkin: "N/A" }];
  };

  const baggage = buildBaggageData();

  // Get passenger type from pricebreakdown
  const getPaxType = (index) => {
    return pricebreakdown[index]?.PaxType || "ADULT";
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2,bgcolor:"white",p:1.5 }}>
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
          <Typography fontSize={14} fontWeight={700} color="#111827">
            Passenger Details
          </Typography>
          <InfoOutlinedIcon sx={{ fontSize: 14, color: "#94A3B8" }} />
        </Box>

      </Box>
      {travellers.length === 0 ? (
        <Typography sx={{ fontSize: 14, color: "#6B7280", textAlign: "center", py: 2 }}>
          No passenger data available
        </Typography>
      ) : (
        travellers.map((traveller, index) => {
          const passengerFields = [
            { label: "Title", value: getTitle(traveller.gender) },
            { label: "First Name", value: traveller.firstName || "N/A" },
            { label: "Last Name", value: traveller.lastName || "N/A" },
            { label: "PAX", value: getPaxType(index) },
            { label: "Date of Birth", value: formatDate(traveller.dateOfBirth) },
            { label: "Passport No", value: traveller.passportNumber || "N/A" },
            { label: "Expire Date", value: formatDate(traveller.passportExpireDate) },
            { label: "Ticket No", value: data?.gdsPNR || data?.airlinePNR || "N/A" },
          ];

          return (
            <Grid container spacing={1} key={index} alignItems="stretch">
              {/* Passenger Card */}
              <Grid item xs={12} md={8}>
                <Box
                  sx={{
                    background: "#DAEBFF",
                    borderRadius: "2px",
                    p: 1,
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Grid container spacing={2}>
                    {passengerFields.map((field) => (
                      <Grid item xs={6} md={2.4} key={field.label}>
                        <Typography
                          sx={{
                            fontSize: 11,
                            color: "#5B6B82",
                            mb: 0.3,
                          }}
                          noWrap
                        >
                          {field.label}
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "var(--primary-color)",
                          }}
                          noWrap
                        >
                          {field.value}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Grid>

              {/* Baggage Card */}
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    background: "#D2E7FF",
                    borderRadius: "2px",
                    px: "10px",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Grid container spacing={2}>
                    {/* Header Row */}
                    <Grid item xs={4}>
                      <Typography fontSize={10.5} color="#5B6B82" mb={0.3} noWrap>
                        Route
                      </Typography>
                    </Grid>
                    <Grid item xs={4} textAlign="center">
                      <Typography fontSize={10.5} color="#5B6B82" mb={0.3} noWrap>
                        Cabin Bag
                      </Typography>
                    </Grid>
                    <Grid item xs={4} textAlign="right">
                      <Typography fontSize={10} color="#5B6B82" mb={0.3} noWrap>
                        Checkin Bag
                      </Typography>
                    </Grid>

                    {/* Data Rows */}
                    {baggage.map((b, i) => (
                      <React.Fragment key={i}>
                        <Grid item xs={4}>
                          <Typography fontSize={12} fontWeight={500} color="var(--primary-color)" noWrap>
                            {b.route}
                          </Typography>
                        </Grid>
                        <Grid item xs={4} textAlign="center">
                          <Typography fontSize={12} fontWeight={500} color="var(--primary-color)" noWrap>
                            {b.cabin}
                          </Typography>
                        </Grid>
                        <Grid item xs={4} textAlign="right">
                          <Typography fontSize={12} fontWeight={500} color="var(--primary-color)" noWrap>
                            {b.checkin}
                          </Typography>
                        </Grid>
                      </React.Fragment>
                    ))}
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          );
        })
      )}
    </Box>
  );
};

export default BookingQuePassengerList;