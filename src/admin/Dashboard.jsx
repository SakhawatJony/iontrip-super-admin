import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

const summaryCards = [
  { title: "Total Search", value: "230" },
  { title: "Total Book", value: "230" },
  { title: "Total Sales", value: "230" },
  { title: "Total Deposit", value: "230" },
];

const serviceCards = [
  { title: "Deposit", value: "230,220 Taka", accent: "#2f6fed" },
  { title: "Flight", value: "230,220 Taka", accent: "#ff4d6d" },
  { title: "Hotel", value: "230,220 Taka", accent: "#2f6fed" },
  { title: "Visa", value: "230,220 Taka", accent: "#2f6fed" },
  { title: "Tour Package", value: "230,220 Taka", accent: "#2f6fed" },
];

const rankCards = [
  "Today Service Rank Based On Search",
  "Today Service Rank Based On Book",
  "Today Service Rank Based On Sale",
];

function SparkLine() {
  return (
    <Box
      component="svg"
      viewBox="0 0 180 40"
      sx={{ width: "100%", height: 40 }}
    >
      <path
        d="M2 30 L20 30 L28 30 L36 30 L44 30 L52 29 L60 28 L68 26 L76 6 L84 24 L92 23 L100 22 L108 23 L116 24 L124 22 L132 23 L140 21 L148 23 L156 20 L164 22 L178 21"
        stroke="#2db95f"
        strokeWidth="2"
        fill="none"
      />
    </Box>
  );
}

export default function Dashboard() {
  return (
    <Box>
      <Grid container spacing={1}>
        {summaryCards.map((card) => (
          <Grid key={card.title} item xs={12} sm={6} md={3}>
            <Box
              sx={{
                bgcolor: "white",
                borderRadius: 1.5,
                p: 2,
                minHeight: 120,
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              <Typography sx={{ fontSize: 14, color: "#4b5563" }}>
                {card.title}
              </Typography>
              <Typography sx={{ fontSize: 32, fontWeight: 600, color: "#333" }}>
                {card.value}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography sx={{ fontSize: 12, color: "#2db95f" }}>
                  +55% than yesterday
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Typography sx={{ fontSize: 11, color: "#9aa0a6" }}>
                  6 May - 7 May
                </Typography>
              </Box>
              <Box sx={{ height: 1, bgcolor: "#e9edf3", mt: 0.5 }} />
            </Box>
          </Grid>
        ))}
        {serviceCards.map((card) => (
          <Grid key={card.title} item xs={12} sm={6} md={2.4}>
            <Box
              sx={{
                bgcolor: "white",
                borderRadius: 1.5,
                p: 2,
                minHeight: 160,
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
              }}
            >
              <Typography sx={{ fontSize: 14, color: card.accent }}>
                {card.title}
              </Typography>
              <Typography sx={{ fontSize: 22, color: "#333" }}>
                {card.value}
              </Typography>
              <SparkLine />
              <Typography sx={{ fontSize: 11, color: "#2db95f" }}>
                +55% than yesterday
              </Typography>
            </Box>
          </Grid>
        ))}
        {rankCards.map((title) => (
          <Grid key={title} item xs={12} md={4}>
            <Box
              sx={{
                bgcolor: "white",
                borderRadius: 1.5,
                p: 2.5,
                minHeight: 200,
              }}
            >
              <Typography
                sx={{ fontSize: 14, fontWeight: 600, color: "#1f3b74" }}
              >
                {title}
              </Typography>
              <Box sx={{ mt: 2, color: "#8a8f99", fontSize: 12 }}>
                <Box sx={{ display: "flex", pb: 1, borderBottom: "1px solid #eee" }}>
                  <Box sx={{ width: 40 }}>SL</Box>
                  <Box sx={{ width: 80 }}>Service</Box>
                  <Box sx={{ flexGrow: 1 }}>Popularity</Box>
                  <Box sx={{ width: 60, textAlign: "right" }}>Deposit</Box>
                </Box>
                {[1, 2].map((row) => (
                  <Box
                    key={row}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      py: 1,
                      borderBottom: row === 2 ? "none" : "1px solid #eee",
                    }}
                  >
                    <Box sx={{ width: 40 }}>01</Box>
                    <Box sx={{ width: 80 }}>FFA</Box>
                    <Box sx={{ flexGrow: 1, pr: 2 }}>
                      <Box sx={{ height: 4, bgcolor: "#f0f0f0" }}>
                        <Box
                          sx={{
                            width: "75%",
                            height: "100%",
                            bgcolor: "#e11d48",
                          }}
                        />
                      </Box>
                    </Box>
                    <Box sx={{ width: 60, textAlign: "right" }}>50%</Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
