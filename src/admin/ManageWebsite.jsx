import React, { useRef, useState } from "react";
import { Box, Grid, TextField, Typography } from "@mui/material";
import JoditEditor from "jodit-react";

const C = {
  cardBg: "#FFFFFF",
  sectionTitle: "#9CA3AF",
  primary: "var(--primary-color, #123D6E)",
  secondary: "var(--primary-dark, #0F2F56)",
};

const outlinePrimary = {
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: C.secondary,
  },
  "& .MuiOutlinedInput-notchedOutline legend": {
    display: "none",
  },
  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: C.secondary,
  },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: C.secondary,
    borderWidth: 1,
  },
};

const fieldSx = {
  ...outlinePrimary,
  "& .MuiOutlinedInput-root:not(.MuiInputBase-multiline)": {
    height: 35,
    minHeight: 35,
    fontSize: "0.8125rem",
  },
  "& .MuiOutlinedInput-input:not(.MuiInputBase-inputMultiline)": {
    py: 0,
    px: "10px",
    height: 35,
    boxSizing: "border-box",
  },
  "& .MuiInputLabel-root": {
    position: "static",
    transform: "none",
    display: "block",
    mb: "4px",
    lineHeight: "20px",
    fontSize: "0.8125rem",
    color: C.primary,
    "&.MuiInputLabel-shrink": {
      transform: "none",
      lineHeight: "20px",
    },
    "&.Mui-focused": {
      color: C.secondary,
    },
  },
  "& .MuiOutlinedInput-input::placeholder": {
    color: C.primary,
    opacity: 1,
  },
};

const multilineFieldSx = {
  ...outlinePrimary,
  "& .MuiOutlinedInput-root": {
  },
  "& .MuiOutlinedInput-input::placeholder": {
    color: C.primary,
    opacity: 1,
  },
  "& .MuiInputLabel-root": {
    position: "static",
    transform: "none",
    display: "block",
    mb: "4px",
    lineHeight: "20px",
    fontSize: "0.8125rem",
    color: C.primary,
    "&.MuiInputLabel-shrink": {
      transform: "none",
      lineHeight: "20px",
    },
    "&.Mui-focused": {
      color: C.secondary,
    },
  },
};

function ColorRow({ label, value, onChange }) {
  const colorInputRef = useRef(null);
  return (
    <Box>
      <Typography
        sx={{
          fontSize: "0.8125rem",
          color: C.primary,
          height: 35,
          lineHeight: "35px",
          mb: 0.5,
        }}
      >
        {label}
      </Typography>
      <Box
        onClick={() => colorInputRef.current?.click()}
        sx={{
          display: "flex",
          alignItems: "center",
          border: `1px solid ${C.secondary}`,
          "&:hover": { borderColor: C.secondary },
          "&:focus-within": { borderColor: C.secondary },
          borderRadius: 1,
          px: "10px",
          minHeight: 35,
          height: 35,
          boxSizing: "border-box",
          cursor: "pointer",
        }}
      >
        <Box
          sx={{
            width: 24,
            height: 24,
            bgcolor: value,
            border: "1px solid rgba(0,0,0,0.12)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <input
            ref={colorInputRef}
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              opacity: 0,
              cursor: "pointer",
            }}
            aria-label={label}
          />
        </Box>
      </Box>
    </Box>
  );
}

function FileUnderlineField({ label, placeholder, fileName, inputRef, accept, onChange }) {
  return (
    <Box>
      <input type="file" ref={inputRef} accept={accept} hidden onChange={onChange} />
      <TextField
        fullWidth
        variant="outlined"
        label={label}
        placeholder={placeholder}
        value={fileName}
        onClick={() => inputRef.current?.click()}
        InputProps={{ readOnly: true }}
        InputLabelProps={{ shrink: true }}
        sx={{ ...fieldSx, "& .MuiInputBase-root": { cursor: "pointer" } }}
      />
    </Box>
  );
}

function SectionHeading({ children, first, tone }) {
  return (
    <Typography
      sx={{
        color: tone === "primary" ? C.primary : C.sectionTitle,
        fontSize: "1.05rem",
        fontWeight: 500,
        mb: 2,
        mt: first ? 0 : 4,
      }}
    >
      {children}
    </Typography>
  );
}

export default function ManageWebsite() {
  const title = "Manage Website";
  const faviconRef = useRef(null);
  const logoRef = useRef(null);

  const [websiteTitle, setWebsiteTitle] = useState("");
  const [faviconName, setFaviconName] = useState("");
  const [logoName, setLogoName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#123D6E");
  const [secondaryColor, setSecondaryColor] = useState("#374151");

  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");

  const [gtmCode, setGtmCode] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");

  const [aboutUs, setAboutUs] = useState("");
  const [privacyPolicy, setPrivacyPolicy] = useState("");
  const [terms, setTerms] = useState("");
  const [refundPolicy, setRefundPolicy] = useState("");

  const onFavicon = (e) => {
    const f = e.target.files?.[0];
    setFaviconName(f?.name || "");
  };

  const onLogo = (e) => {
    const f = e.target.files?.[0];
    setLogoName(f?.name || "");
  };

  return (
    <Box
      sx={{
        bgcolor: C.cardBg,
        minHeight: "100vh",
        p: 3,
        m: { xs: -2, md: -3 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          p: 1,
          borderRadius: 1,
          bgcolor: "var(--primary-dark, #024DAF)",
        }}
      >
        <Typography sx={{ fontSize: 18, fontWeight: 500, color: "#FFFFFF" }}>{title}</Typography>
      </Box>

      <SectionHeading first>Website Setting</SectionHeading>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            variant="outlined"
            label="Website Title"
            placeholder="Enter Website Title"
            value={websiteTitle}
            onChange={(e) => setWebsiteTitle(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={fieldSx}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <FileUnderlineField
            label="Website Fav Icon"
            placeholder="Choose Website Favicon"
            fileName={faviconName}
            inputRef={faviconRef}
            accept="image/*,.ico"
            onChange={onFavicon}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <FileUnderlineField
            label="Website Logo"
            placeholder="Choose Website logo"
            fileName={logoName}
            inputRef={logoRef}
            accept="image/*"
            onChange={onLogo}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <ColorRow label="Website Primary Color" value={primaryColor} onChange={setPrimaryColor} />
        </Grid>

        <Grid item xs={12} md={6}>
          <ColorRow label="Website Secondary Color" value={secondaryColor} onChange={setSecondaryColor} />
        </Grid>
      </Grid>

      <SectionHeading>Website Contact</SectionHeading>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            variant="outlined"
            label="Contact Email"
            placeholder="Enter Email"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={fieldSx}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            variant="outlined"
            label="Contact Phone Number"
            placeholder="Enter Phone Number"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={fieldSx}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            variant="outlined"
            label="Whtsapp Phone Number"
            placeholder="Enter Phone Number"
            value={whatsappPhone}
            onChange={(e) => setWhatsappPhone(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={fieldSx}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            variant="outlined"
            label="Facebook Page Address"
            placeholder="Enter Facebook Address"
            value={facebookUrl}
            onChange={(e) => setFacebookUrl(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={fieldSx}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            variant="outlined"
            label="Instagram Address"
            placeholder="Enter Instagram Address"
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={fieldSx}
          />
        </Grid>
      </Grid>

      <SectionHeading>Website SEO Content</SectionHeading>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            variant="outlined"
            label="Google TAG manager Code"
            placeholder="Enter Google Tag Manager code"
            value={gtmCode}
            onChange={(e) => setGtmCode(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={fieldSx}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            variant="outlined"
            label="Meta Tag Title"
            placeholder="Enter"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={fieldSx}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            variant="outlined"
            label="Meta Tag Description"
            placeholder="Enter"
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={fieldSx}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            variant="outlined"
            label="Meta Tag Key Words"
            placeholder="Enter"
            value={metaKeywords}
            onChange={(e) => setMetaKeywords(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={fieldSx}
          />
        </Grid>
      </Grid>

      <SectionHeading tone="primary">Company About Us</SectionHeading>
      <Box sx={{ mb: 2 }}>
        <JoditEditor
          value={aboutUs}
          config={{ readonly: false, height: 220, placeholder: "Enter About Us..." }}
          tabIndex={1}
          onBlur={(newContent) => setAboutUs(newContent)}
        />
      </Box>

      <SectionHeading tone="primary">Company Privacy Policy</SectionHeading>
      <Box sx={{ mb: 2 }}>
        <JoditEditor
          value={privacyPolicy}
          config={{ readonly: false, height: 220, placeholder: "Enter Privacy Policy..." }}
          tabIndex={2}
          onBlur={(newContent) => setPrivacyPolicy(newContent)}
        />
      </Box>

      <SectionHeading tone="primary">Company Terms & Conditions</SectionHeading>
      <Box sx={{ mb: 2 }}>
        <JoditEditor
          value={terms}
          config={{ readonly: false, height: 220, placeholder: "Enter Terms & Conditions..." }}
          tabIndex={3}
          onBlur={(newContent) => setTerms(newContent)}
        />
      </Box>

      <SectionHeading tone="primary">Company Refund Policy</SectionHeading>
      <Box sx={{ mb: 1 }}>
        <JoditEditor
          value={refundPolicy}
          config={{ readonly: false, height: 220, placeholder: "Enter Refund Policy..." }}
          tabIndex={4}
          onBlur={(newContent) => setRefundPolicy(newContent)}
        />
      </Box>
    </Box>
  );
}
