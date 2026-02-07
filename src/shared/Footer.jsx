import React from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  Divider,
  Stack,
} from "@mui/material";
import paymentmethodes from "../assets/Home/fotter/paymentmethode.png";
import facebook from "../assets/Home/fotter/facebook.png";
import linkdin from "../assets/Home/fotter/linkdin.png";
import twiter from "../assets/Home/fotter/twitur.png";

const Footer = () => {
  return (
    <Box sx={{ bgcolor: "#ffffff", borderTop: "1px solid #eaeaea", width: "100%",mt:"100px" }}>
      {/* TOP BAR */}
      <Container maxWidth={false} sx={{ px: { xs: 2, md: 6 } }}>
        <Box
          sx={{
            py: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Stack direction="row" spacing={1.2} alignItems="center">
            <Typography sx={{ fontSize: 12, color: "#777" }}>
              Payment methods we accept
            </Typography>
            <Box component="img" src={paymentmethodes} height={18} />
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center">
            <Typography sx={{ fontSize: 12, color: "#777" }}>
              Helpline +880 1788 789911
            </Typography>
            <Stack direction="row">
              <Typography sx={{ color: "#A2A6A9", pr: "2px" }}>
                Follow us
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box component="img" src={facebook} height={14} />
                <Box component="img" src={twiter} height={14} />
                <Box component="img" src={linkdin} height={14} />
              </Stack>
            </Stack>
          </Stack>
        </Box>
      </Container>

      <Divider />

      {/* MAIN FOOTER */}
      <Container maxWidth={false} sx={{ px: { xs: 2, md: 6 } }}>
        <Grid container spacing={4} sx={{ py: 4 }}>
          {/* Quick Links */}
          <Grid item xs={12} sm={4} md={2}>
            <Typography sx={titleStyle}>Quick Links</Typography>
            <FooterLink text="About Us" />
            <FooterLink text="Contact Us" />
            <FooterLink text="Become Agent" />
            <FooterLink text="Tour Guide" />
          </Grid>

          {/* Company */}
          <Grid item xs={12} sm={4} md={2}>
            <Typography sx={titleStyle}>Company</Typography>
            <FooterLink text="Our Partners" />
            <FooterLink text="News" />
            <FooterLink text="Promotions" />
          </Grid>

          {/* Support */}
          <Grid item xs={12} sm={4} md={2}>
            <Typography sx={titleStyle}>Support</Typography>
            <FooterLink text="Contact Us" />
            <FooterLink text="Ask Question" />
            <FooterLink text="Terms and Conditions" />
          </Grid>

          {/* Company (Duplicate column like image) */}
          <Grid item xs={12} sm={4} md={2}>
            <Typography sx={titleStyle}>Company</Typography>
            <FooterLink text="Our Partners" />
            <FooterLink text="News" />
            <FooterLink text="Promotions" />
          </Grid>

          {/* Our Office */}
          <Grid item xs={12} sm={8} md={4}>
            <Typography sx={titleStyle}>Our Office</Typography>

            <Typography sx={officeTitle}>Dhaka Office</Typography>
            <Typography sx={officeText}>
              78/6 (3rd Floor) Purana Paltan, Dhaka
            </Typography>

            <Box sx={{ mt: 2 }}>
              <Typography sx={officeTitle}>Chattogram Office</Typography>
              <Typography sx={officeText}>
                72/8 (3rd Floor) Purana Paltan, Chattogram
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>

      <Divider />

      {/* BOTTOM */}
      <Container maxWidth={false} sx={{ px: { xs: 2, md: 6 } }}>
        <Box
          sx={{
            py: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 11,
            color: "#999",
          }}
        >
          <Typography sx={{ fontSize: 11 }}>
            © 2018, All Rights Reserved. Use of Fly Far Tech websites means
            acceptance of Terms & Conditions and Privacy Policy.
          </Typography>

          <Typography sx={{ fontSize: 11 }}>
            Developed by Fly Far Tech
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

const FooterLink = ({ text }) => (
  <Link
    href="#"
    underline="none"
    sx={{
      display: "block",
      fontSize: 14,
      color: "#A2A6A9",
      mb: 0.6,
      "&:hover": { color: "#000" },
    }}
  >
    {text}
  </Link>
);

const titleStyle = {
  fontSize: 20,
  fontWeight: 600,
  color: "#7C7F82",
  mb: 1.2,
};

const officeTitle = {
  fontSize: 13,
  fontWeight: 600,
  color: "#A2A6A9",
};

const officeText = {
  fontSize: 13,
  color: "#A2A6A9",
};

export default Footer;
