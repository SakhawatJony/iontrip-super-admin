import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

/**
 * Captures an HTML element and downloads it as a PDF file.
 * @param {HTMLElement} element - The DOM element to capture (e.g. a ref's current)
 * @param {string} filename - The filename for the download (without .pdf)
 * @returns {Promise<void>}
 */
export async function downloadElementAsPdf(element, filename = "e-ticket") {
  if (!element) return;

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

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
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight) * 0.95;
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 5;

    pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    pdf.save(`${filename}.pdf`);
  } catch (err) {
    console.error("PDF download failed:", err);
    throw err;
  }
}
