import axios from "axios";
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputPath = path.resolve(__dirname, "../JSON/productDetails.json");
const PRODUCTS_JSON_URL = "https://neemans.com/products.json";
const PRODUCT_PAGE_URL = "https://neemans.com/products/";

(async () => {
  // Step 1: Fetch product handles from all pages
  console.log("Fetching product list (all pages)...");
  let pageNum = 1;
  let handles = [];
  while (true) {
    const url = `${PRODUCTS_JSON_URL}?page=${pageNum}`;
    const response = await axios.get(url);
    const products = response.data.products;
    if (!products || products.length === 0) break;
    handles.push(...products.map((p) => p.handle));
    console.log(`Fetched page ${pageNum} (${products.length} products)`);
    pageNum++;
  }

  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  const output = {};

  // Step 2: Loop through handles and scrape each page
  for (let i = 0; i < handles.length; i++) {
    const handle = handles[i];
    const url = `${PRODUCT_PAGE_URL}${handle}`;
    console.log(`Scraping [${i + 1}/${handles.length}]: ${handle}`);

    try {
      await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

      const details = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll(".sc-rtn-li"));
        return elements.slice(0, 3).map((el) => {
          const img = el.querySelector("img");
          const span = el.querySelector("span");
          return { 
            src: img?.src || "",
            detail: span?.textContent.trim() || "",
          };
        });
      });

      output[handle] = details;
    } catch (err) {
      console.error(`Error scraping ${handle}:`, err.message);
      output[handle] = [];
    }
  }

  await browser.close();

  // Step 3: Save to file
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log("✅ Done! Data saved to productDetails.json");
})();