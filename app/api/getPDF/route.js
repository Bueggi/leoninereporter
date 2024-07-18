import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

const handler = async (req, res) => {
  const printPDF = async () => {
    console.log("came here in printPDF");
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto("https://blog.risingstack.com", {
      waitUntil: "networkidle0",
    });
    const pdf = await page.pdf({ format: "A4" });

    await browser.close();
    return pdf;
  };
  printPDF().then((pdf) => {
    console.log("came here in call");
    const newHeaders = new Headers(req.headers);
    newHeaders.set({
      "Content-Type": "application/pdf",
      "Content-Length": pdf.length,
    });
    return NextResponse.next({
      request: {
        // New request headers
        headers: newHeaders,
      },
    });
  });
  return NextResponse.json({ message: "laeuft" });
};

export { handler as GET };
