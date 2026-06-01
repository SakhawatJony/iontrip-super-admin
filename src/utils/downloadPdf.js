import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

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
    img.crossOrigin = "anonymous";
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
  await Promise.all(
    images.map(async (img) => {
      const src = img.getAttribute("src");
      if (!src || src.startsWith("data:")) return;

      img.crossOrigin = "anonymous";
      img.referrerPolicy = "no-referrer";

      try {
        const response = await fetch(src, { mode: "cors", cache: "force-cache" });
        if (response.ok) {
          const dataUrl = await blobToDataUrl(await response.blob());
          img.src = dataUrl;
          await waitForImage(img);
          return;
        }
      } catch {
        // fall through
      }

      try {
        const dataUrl = await urlToDataUrlViaImage(src);
        img.src = dataUrl;
        await waitForImage(img);
      } catch {
        img.removeAttribute("src");
      }
    })
  );
}

async function waitForAllImages(element) {
  const images = Array.from(element.querySelectorAll("img[src]"));
  await Promise.all(images.map((img) => waitForImage(img)));
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

/**
 * Captures an HTML element and downloads it as a PDF file.
 * @param {HTMLElement} element - The DOM element to capture (e.g. a ref's current)
 * @param {string} filename - The filename for the download (without .pdf)
 * @returns {Promise<void>}
 */
export async function downloadElementAsPdf(element, filename = "e-ticket") {
  if (!element) return;

  const restoreElement = prepareElementForCapture(element);

  try {
    await inlineExternalImages(element);
    await waitForAllImages(element);

    // Allow layout/paint after moving on-screen
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: "#ffffff",
      imageTimeout: 15000,
      width: element.scrollWidth || element.offsetWidth,
      height: element.scrollHeight || element.offsetHeight,
      windowWidth: element.scrollWidth || element.offsetWidth,
      windowHeight: element.scrollHeight || element.offsetHeight,
    });

    restoreElement();

    if (!canvas.width || !canvas.height) {
      throw new Error("PDF capture produced an empty canvas");
    }

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const pageContentHeight = pdfHeight - 10;
    const scaledWidth = pdfWidth * 0.95;
    const scaledHeight = (imgHeight * scaledWidth) / imgWidth;

    if (scaledHeight <= pageContentHeight) {
      pdf.addImage(imgData, "PNG", (pdfWidth - scaledWidth) / 2, 5, scaledWidth, scaledHeight);
    } else {
      let remainingHeight = imgHeight;
      let positionY = 0;
      const pageCanvasHeight = Math.floor((pageContentHeight * imgWidth) / scaledWidth);

      while (remainingHeight > 0) {
        const sliceHeight = Math.min(pageCanvasHeight, remainingHeight);
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = imgWidth;
        pageCanvas.height = sliceHeight;
        const ctx = pageCanvas.getContext("2d");
        ctx.drawImage(canvas, 0, positionY, imgWidth, sliceHeight, 0, 0, imgWidth, sliceHeight);
        const sliceData = pageCanvas.toDataURL("image/png");
        const sliceScaledHeight = (sliceHeight * scaledWidth) / imgWidth;

        if (positionY > 0) pdf.addPage();
        pdf.addImage(sliceData, "PNG", (pdfWidth - scaledWidth) / 2, 5, scaledWidth, sliceScaledHeight);

        positionY += sliceHeight;
        remainingHeight -= sliceHeight;
      }
    }

    pdf.save(`${filename}.pdf`);
  } catch (err) {
    restoreElement();
    console.error("PDF download failed:", err);
    throw err;
  }
}
