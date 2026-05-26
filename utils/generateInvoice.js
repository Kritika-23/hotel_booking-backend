import puppeteer from "puppeteer";
import { invoiceTemplate } from "./invoiceTemplate.js";

export const generateInvoicePDF = async (booking) => {
  const browser = await puppeteer.launch({
    headless: "new",
  });

  const page = await browser.newPage();

  const html = invoiceTemplate(booking);

  await page.setContent(html, {
    waitUntil: "networkidle0",
  });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
  });

  await browser.close();

  return pdfBuffer;
};