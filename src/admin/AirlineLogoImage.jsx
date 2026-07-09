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
  const [attempt, setAttempt] = useState(0);
  const [enhancedSrc, setEnhancedSrc] = useState("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setAttempt(0);
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

  const src = preloadedSrc || enhancedSrc || candidates[attempt] || "";

  if (!src) {
    if (showCodeFallback && code) {
      return (
        <Box
          component="span"
          sx={{ fontSize: size * 0.28, fontWeight: 800, lineHeight: 1, ...codeFallbackSx }}
        >
          {code}
        </Box>
      );
    }
    return <FlightTakeoffIcon sx={{ fontSize: fallbackIconSize, ...iconSx }} />;
  }

  if (failed && !preloadedSrc && !enhancedSrc && attempt >= candidates.length - 1) {
    if (showCodeFallback && code) {
      return (
        <Box
          component="span"
          sx={{ fontSize: size * 0.28, fontWeight: 800, lineHeight: 1, ...codeFallbackSx }}
        >
          {code}
        </Box>
      );
    }
    return <FlightTakeoffIcon sx={{ fontSize: fallbackIconSize, ...iconSx }} />;
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
      onError={() => {
        if (!preloadedSrc && !enhancedSrc && attempt < candidates.length - 1) {
          setAttempt((prev) => prev + 1);
          return;
        }
        setFailed(true);
      }}
      sx={{ width: size, height: size, objectFit: "contain", display: "block", ...imgSx }}
    />
  );
}
