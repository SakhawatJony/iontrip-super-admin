export function getAirlineLogoCandidateUrls(carrierCode) {
  const code = String(carrierCode || "").trim().toUpperCase();
  if (!code) return [];

  // Same-origin proxies first (Vite in dev, Netlify redirects in prod) so PDF can
  // fetch without CORS. Absolute CDNs are fallbacks; loadAirlineLogoSource rejects
  // non-image responses (SPA HTML from a missing proxy must never become a data URL).
  return [
    `/airline-logos/${code}.png`,
    `/gstatic-logos/${code}.png`,
    `https://tbbd-flight.s3.ap-southeast-1.amazonaws.com/airlines-logo/${code}.png`,
    `https://www.gstatic.com/flights/airline_logos/70px/${code}.png`,
    `https://pics.avs.io/200/200/${code}.png`,
    `https://pics.avs.io/132/132/${code}.png`,
  ];
}

export function extractAirlineCodeFromLogoSrc(src) {
  const match = String(src || "").match(/\/([A-Z0-9]{2})\.png(?:\?|$)/i);
  return match?.[1]?.toUpperCase() || "";
}

export function getAirlineLogoProxyUrl(carrierCode) {
  return getAirlineLogoCandidateUrls(carrierCode)[0] || "";
}

export async function loadAirlineLogoFromCandidates(carrierCode) {
  for (const url of getAirlineLogoCandidateUrls(carrierCode)) {
    const result = await loadAirlineLogoSource(url);
    if (result) return result;
  }
  return null;
}

const blobToDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

const isImageContentType = (contentType) =>
  String(contentType || "")
    .toLowerCase()
    .startsWith("image/");

/** Load airline logo for PDF/UI; returns data URL or direct URL when displayable. */
export async function loadAirlineLogoSource(url) {
  if (!url) return null;

  try {
    const response = await fetch(url, { cache: "force-cache" });
    if (response.ok && isImageContentType(response.headers.get("content-type"))) {
      const blob = await response.blob();
      if (blob.size > 0 && isImageContentType(blob.type || response.headers.get("content-type"))) {
        return await blobToDataUrl(blob);
      }
    }
  } catch {
    // fall through to image element loading
  }

  return new Promise((resolve) => {
    const attempt = (useCors) => {
      const img = new Image();
      if (useCors) img.crossOrigin = "anonymous";

      img.onload = () => {
        if (!img.naturalWidth || !img.naturalHeight) {
          if (!useCors) {
            attempt(true);
            return;
          }
          resolve(null);
          return;
        }

        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(url);
            return;
          }
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        } catch {
          resolve(url);
        }
      };

      img.onerror = () => {
        if (!useCors) {
          attempt(true);
          return;
        }
        resolve(null);
      };

      img.src = url;
    };

    attempt(false);
  });
}

/** Normalize airline logo src for PDF capture (URL or carrier code). */
export function toAirlineLogoProxyUrl(urlOrCode) {
  if (!urlOrCode) return "";
  const value = String(urlOrCode).trim();
  if (value.startsWith("http") || value.startsWith("data:") || value.startsWith("/")) {
    return value;
  }
  return getAirlineLogoProxyUrl(value);
}
