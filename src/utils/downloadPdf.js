import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import {
  extractAirlineCodeFromLogoSrc,
  loadAirlineLogoFromCandidates,
  toAirlineLogoProxyUrl,
} from "../admin/flightAmenityUtils";
import { getAgentLogoProxyUrl } from "./resolveAgentPdfInfo";

const waitForImage = (img, timeoutMs = 8000) =>
  new Promise((resolve) => {
    if (img.complete && img.naturalHeight > 0) {
      resolve();
      return;
    }
    const done = () => resolve();
    img.addEventListener("load", done, { once: true });
    img.addEventListener("error", done, { once: true });
    setTimeout(done, timeoutMs);
  });

const blobToDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

const urlToDataUrlViaImage = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const isSameOrigin = url.startsWith("/") || url.startsWith(window.location.origin);
    if (!isSameOrigin) {
      img.crossOrigin = "anonymous";
    }
    img.referrerPolicy = "no-referrer";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas unavailable"));
          return;
        }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });

/** Fetch remote images and inline as data URLs so html2canvas renders them in PDF. */
async function inlineExternalImages(element) {
  const images = Array.from(element.querySelectorAll("img"));

  const inlineOne = async (img) => {
    const rawSrc = img.getAttribute("src");
    const src = getAgentLogoProxyUrl(toAirlineLogoProxyUrl(rawSrc));
    if (src !== rawSrc) {
      img.setAttribute("src", src);
    }
    if (!src || src.startsWith("data:")) {
      await waitForImage(img);
      return;
    }

    const carrierCode =
      img.getAttribute("data-carrier-code") || extractAirlineCodeFromLogoSrc(src);

    const trySetDataUrl = async (dataUrl) => {
      if (!dataUrl) return false;
      img.src = dataUrl;
      await waitForImage(img);
      return img.naturalHeight > 0;
    };

    if (carrierCode) {
      const fromCandidates = await loadAirlineLogoFromCandidates(carrierCode);
      if (await trySetDataUrl(fromCandidates)) return;
    }

    try {
      const response = await fetch(src, { cache: "force-cache" });
      const contentType = String(response.headers.get("content-type") || "").toLowerCase();
      if (response.ok && contentType.startsWith("image/")) {
        const dataUrl = await blobToDataUrl(await response.blob());
        if (await trySetDataUrl(dataUrl)) return;
      }
    } catch {
      // fall through
    }

    try {
      const dataUrl = await urlToDataUrlViaImage(src);
      if (await trySetDataUrl(dataUrl)) return;
    } catch {
      img.removeAttribute("crossorigin");
      img.referrerPolicy = "no-referrer";
      if (img.getAttribute("src") !== src) {
        img.setAttribute("src", src);
      }
      await waitForImage(img, 12000);
    }
  };

  await Promise.all(images.map(inlineOne));
}

async function waitForAllImages(element) {
  const images = Array.from(element.querySelectorAll("img[src]"));
  await Promise.all(images.map((img) => waitForImage(img)));
}

function rgbToHex(color) {
  if (!color || color === "transparent") return "";
  if (color.startsWith("#")) return color;
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (!match) return "";
  return `#${match.slice(1, 4).map((n) => Number(n).toString(16).padStart(2, "0")).join("")}`;
}

/** html2canvas often drops MUI SvgIcon paths that use currentColor — inline explicit fills. */
function inlineSvgColors(root) {
  if (!root?.querySelectorAll) return;

  root.querySelectorAll("svg").forEach((svg) => {
    if (!svg.getAttribute("xmlns")) {
      svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    }

    const style = window.getComputedStyle(svg);
    const color =
      rgbToHex(style.color) ||
      rgbToHex(style.fill) ||
      svg.getAttribute("color") ||
      "#002D85";

    svg.querySelectorAll("path, circle, rect, polygon, ellipse, line, polyline").forEach((node) => {
      const fill = node.getAttribute("fill");
      if (!fill || fill === "currentColor") {
        node.setAttribute("fill", color);
      }

      const stroke = node.getAttribute("stroke");
      if (stroke === "currentColor") {
        node.setAttribute("stroke", color);
      }
    });
  });
}

/** Briefly move element on-screen so html2canvas can paint it (hidden/off-screen nodes often capture blank). */
function prepareElementForCapture(element) {
  element.style.setProperty("position", "fixed", "important");
  element.style.setProperty("left", "0", "important");
  element.style.setProperty("top", "0", "important");
  element.style.setProperty("visibility", "visible", "important");
  element.style.setProperty("opacity", "1", "important");
  element.style.setProperty("z-index", "-1", "important");
  element.style.setProperty("pointer-events", "none", "important");

  return () => {
    element.style.removeProperty("position");
    element.style.removeProperty("left");
    element.style.removeProperty("top");
    element.style.removeProperty("visibility");
    element.style.removeProperty("opacity");
    element.style.removeProperty("z-index");
    element.style.removeProperty("pointer-events");
  };
}

/** JPEG keeps ticket/invoice PDFs small; PNG often balloons to multiple MB. */
const PDF_IMAGE_TYPE = "JPEG";
const PDF_JPEG_QUALITY = 0.78;
const PDF_CAPTURE_SCALE = 1.5;

const canvasToPdfImage = (sourceCanvas) =>
  sourceCanvas.toDataURL("image/jpeg", PDF_JPEG_QUALITY);

/**
 * Captures an HTML element and downloads it as a PDF file.
 * @param {HTMLElement} element - The DOM element to capture (e.g. a ref's current)
 * @param {string} filename - The filename for the download (without .pdf)
 * @param {{ fitSinglePage?: boolean }} [options]
 * @returns {Promise<void>}
 */
export async function downloadElementAsPdf(element, filename = "e-ticket", options = {}) {
  const { fitSinglePage = false } = options;
  if (!element) return;

  const restoreElement = prepareElementForCapture(element);

  try {
    await inlineExternalImages(element);
    await waitForAllImages(element);
    inlineSvgColors(element);

    // Allow layout/paint after moving on-screen
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    const canvas = await html2canvas(element, {
      scale: PDF_CAPTURE_SCALE,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: "#ffffff",
      imageTimeout: 15000,
      width: element.scrollWidth || element.offsetWidth,
      height: element.scrollHeight || element.offsetHeight,
      windowWidth: element.scrollWidth || element.offsetWidth,
      windowHeight: element.scrollHeight || element.offsetHeight,
      onclone: (_doc, cloned) => {
        inlineSvgColors(cloned);
      },
    });

    restoreElement();

    if (!canvas.width || !canvas.height) {
      throw new Error("PDF capture produced an empty canvas");
    }

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const margin = 4;
    const maxW = pdfWidth - margin * 2;
    const maxH = pdfHeight - margin * 2;
    let scaledWidth = maxW;
    let scaledHeight = (imgHeight * scaledWidth) / imgWidth;

    if (fitSinglePage && scaledHeight > maxH) {
      scaledHeight = maxH;
      scaledWidth = (imgWidth * scaledHeight) / imgHeight;
    }

    if (!fitSinglePage && scaledHeight > maxH) {
      let remainingHeight = imgHeight;
      let positionY = 0;
      const pageCanvasHeight = Math.floor((maxH * imgWidth) / scaledWidth);

      while (remainingHeight > 0) {
        const sliceHeight = Math.min(pageCanvasHeight, remainingHeight);
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = imgWidth;
        pageCanvas.height = sliceHeight;
        const ctx = pageCanvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, imgWidth, sliceHeight);
        ctx.drawImage(canvas, 0, positionY, imgWidth, sliceHeight, 0, 0, imgWidth, sliceHeight);
        const sliceData = canvasToPdfImage(pageCanvas);
        const sliceScaledHeight = (sliceHeight * scaledWidth) / imgWidth;

        if (positionY > 0) pdf.addPage();
        pdf.addImage(
          sliceData,
          PDF_IMAGE_TYPE,
          (pdfWidth - scaledWidth) / 2,
          margin,
          scaledWidth,
          sliceScaledHeight,
          undefined,
          "FAST"
        );

        positionY += sliceHeight;
        remainingHeight -= sliceHeight;
      }
    } else {
      pdf.addImage(
        canvasToPdfImage(canvas),
        PDF_IMAGE_TYPE,
        (pdfWidth - scaledWidth) / 2,
        margin,
        scaledWidth,
        scaledHeight,
        undefined,
        "FAST"
      );
    }

    pdf.save(`${filename}.pdf`);
  } catch (err) {
    restoreElement();
    console.error("PDF download failed:", err);
    throw err;
  }
}
