import React, { useEffect, useMemo, useState } from "react";
import { Box } from "@mui/material";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import { getAirlineLogoCandidateUrls, loadAirlineLogoSource } from "./flightAmenityUtils";

export default function AirlineLogoImage({
  carrierCode,
  preloadedSrc = "",
  alt = "",
  size = 32,
  fallbackIconSize = 19,
  showCodeFallback = true,
  codeFallbackSx = {},
  iconSx = {},
  imgSx = {},
}) {
  const code = String(carrierCode || "").trim().toUpperCase();
  const candidates = useMemo(() => getAirlineLogoCandidateUrls(code), [code]);
  const [enhancedSrc, setEnhancedSrc] = useState("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setEnhancedSrc("");
    setFailed(false);
  }, [code, preloadedSrc]);

  useEffect(() => {
    if (preloadedSrc || !code) return undefined;

    let cancelled = false;

    (async () => {
      for (const url of candidates) {
        const loaded = await loadAirlineLogoSource(url);
        if (cancelled) return;
        if (loaded) {
          setEnhancedSrc(loaded);
          setFailed(false);
          return;
        }
      }
      if (!cancelled) setFailed(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [code, preloadedSrc, candidates]);

  const src = failed ? "" : preloadedSrc || enhancedSrc || "";

  const renderCodeFallback = () =>
    showCodeFallback && code ? (
      <Box
        component="span"
        sx={{ fontSize: size * 0.28, fontWeight: 800, lineHeight: 1, ...codeFallbackSx }}
      >
        {code}
      </Box>
    ) : (
      <FlightTakeoffIcon sx={{ fontSize: fallbackIconSize, ...iconSx }} />
    );

  // Wait for a verified image — never paint unverified `/airline-logos` paths that
  // can be SPA HTML (200 text/html) on Netlify before logo proxies are configured.
  if (!src) {
    if (failed || !code) return renderCodeFallback();
    return (
      <Box
        sx={{
          width: size,
          height: size,
          display: "block",
          ...imgSx,
        }}
      />
    );
  }

  return (
    <Box
      component="img"
      key={src}
      src={src}
      alt={alt}
      data-carrier-code={code}
      loading="eager"
      decoding="sync"
      onError={() => setFailed(true)}
      sx={{ width: size, height: size, objectFit: "contain", display: "block", ...imgSx }}
    />
  );
}
