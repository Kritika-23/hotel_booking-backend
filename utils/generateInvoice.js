import puppeteer from "puppeteer";
import { invoiceTemplate } from "./invoiceTemplate.js";

export const generateInvoicePDF = async (booking) => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  const html = invoiceTemplate(booking);

  await page.setContent(html, {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
  });

  await browser.close();

  return pdfBuffer;
};
