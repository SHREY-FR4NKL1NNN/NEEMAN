import axios from "axios";
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import pLimit from 'p-limit';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputPath = path.resolve(__dirname, "../../public/data/productDetails.json");
const PRODUCTS_JSON_URL = "https://neemans.com/products.json";
const PRODUCT_PAGE_URL = "https://neemans.com/products/";

(async () => {
  console.log("Fetching product list...");
  let pageNum = 1;
  let handles = [];
  while (true) {
    const url = `${PRODUCTS_JSON_URL}?page=${pageNum}`;
    const response = await axios.get(url);
    const products = response.data.products;
    if (!products || products.length === 0) break;
    handles.push(...products.map((p) => p.handle));
    pageNum++;
  }

  const browser = await puppeteer.launch({ headless: "new" });
  const output = {};
  const limit = pLimit(5); // concurrency limit

  async function scrapeHandle(handle, i, total) {
    const page = await browser.newPage();
    const url = `${PRODUCT_PAGE_URL}${handle}`;
    let retries = 2;
    let lastErr = null;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
        // Check for 404
        const is404 = await page.evaluate(() => !!document.querySelector('.template-404, .error-page, .shopify-section--404'));
        if (is404) throw new Error('404 Not Found');
        // Wait for main content to load (features or care image)
        await new Promise(res => setTimeout(res, 1000));
        const data = await page.evaluate(() => {
          const result = {};
          // 1. Advantages
          const advEls = Array.from(document.querySelectorAll(".sc-rtn-li"));
          result.Advantages = advEls.slice(0, 3).map((el) => ({
            src: el.querySelector("img")?.getAttribute('src') || el.querySelector("img")?.getAttribute('data-src') || "",
            detail: el.querySelector("span")?.textContent.trim() || "",
          }));
          // 2. Features
          const featureDivs = document.querySelectorAll('[class^="innerpmsec"]');
          const features = Array.from(featureDivs).map((el, index) => {
            const classMatch = Array.from(el.classList).find(cls => cls.startsWith('innerpmsec'));
            const numMatch = classMatch ? classMatch.match(/\d+$/) : null;
            const num = numMatch ? numMatch[0] : '';
            const imgEl = el.querySelector(`.pm_sec${num}_img img`);
            const img = imgEl?.getAttribute('src') || imgEl?.getAttribute('data-src') || "";
            const title = el.querySelector(`.product-description-short${num} h4`)?.textContent.trim() || "";
            const shortP = el.querySelector(`.product-description-short${num} p`)?.textContent.trim() || "";
            const longP = el.querySelector(`.product-description-full${num} p`)?.textContent.trim() || "";
            return {
              index,
              src: img,
              "title": title,
              "short-description": shortP,
              "long-description": longP,
            };
          });
          result.Features = features;
          // 3. Videos
          const video = document.getElementById("video_product");
          let mainVideoUrl = "";
          if (video) {
            mainVideoUrl = video.src || video.getAttribute('data-src') || "";
            if (!mainVideoUrl) {
              const source = video.querySelector('source');
              mainVideoUrl = source?.src || "";
            }
          }
          result.Videos = {
            "main-video": mainVideoUrl,
          };
          // 4. FAQ
          const faqWrappers = Array.from(document.querySelectorAll('.faq-wrapper'));
          result.FAQ = faqWrappers.map(el => {
            const question = el.querySelector('.accordion-title')?.textContent.trim() || "";
            const answer = el.querySelector('.panel.accordion-body')?.textContent.trim() || "";
            return { question, answer };
          }).filter(faq => faq.question && faq.answer);
          // 5. CareNInfo
          const careImgEl = document.querySelector('.sc-care-img.care-desk-banner');
          const mainImg = careImgEl?.getAttribute('src') || careImgEl?.getAttribute('data-src') || "";
          const modalImg = document.querySelector('.modal-content img')?.getAttribute('src') || "";
          result.CareNInfo = {
            "main-image": mainImg,      // image 1
            "more-info-image": modalImg // image 2
          };
          // 6. SimilarProductSlider
          const sliderAnchors = Array.from(
            document.querySelectorAll('#sc-recom-product_new-ui .Carousel__Cell_cus_new .ProductItem__Title a')
          );
          result.SimilarProductSlider = sliderAnchors.map(a => {
            let href = a.getAttribute('href');
            if (href && !href.startsWith('http')) {
              href = 'https://neemans.com' + href;
            }
            return href;
          });
          return result;
        });
        output[handle] = data;
        await page.close();
        if ((i + 1) % 10 === 0) {
          fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
        }
        return;
      } catch (err) {
        lastErr = err;
        if (attempt === retries) {
          console.error(`❌ Error scraping ${handle}:`, err.message);
          output[handle] = {
            Advantages: [],
            Features: [],
            Videos: { "main-video": "" },
            FAQ: [],
            CareNInfo: { "main-image": "", "more-info-image": "" },
            SimilarProductSlider: [],
          };
          await page.close();
        } else {
          await new Promise(res => setTimeout(res, 2000)); // wait before retry
        }
      }
    }
    // Throttle to avoid rate limiting
    await new Promise(res => setTimeout(res, 5000));
  }

  // Run with concurrency
  await Promise.all(handles.map((handle, i) => limit(() => scrapeHandle(handle, i, handles.length))));

  await browser.close();

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log("✅ All data saved to productDetails.json");
})();