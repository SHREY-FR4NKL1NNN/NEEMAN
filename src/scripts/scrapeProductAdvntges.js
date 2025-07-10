import axios from "axios";
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
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
  const page = await browser.newPage();

  const output = {};

  for (let i = 0; i < handles.length; i++) {
    const handle = handles[i];
    const url = `${PRODUCT_PAGE_URL}${handle}`;
    console.log(`Scraping [${i + 1}/${handles.length}]: ${handle}`);

    try {
      await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

      const data = await page.evaluate(() => {
        const result = {};

        // 1. Advantages
        const advEls = Array.from(document.querySelectorAll(".sc-rtn-li"));
        result.Advantages = advEls.slice(0, 3).map((el) => ({
          src: el.querySelector("img")?.src || "",
          detail: el.querySelector("span")?.textContent.trim() || "",
        }));

        // 2. Features
        const featureWrapper = document.querySelector(".sm_product_metafield");
        result.Features = [];
        if (featureWrapper) {
          const featureDivs = Array.from(featureWrapper.children).filter((el) =>
            el.className.startsWith("pmsec")
          );

          featureDivs.forEach((el, index) => {
            const img = el.querySelector("img")?.src || "";
            const h4 = el.querySelector("h4")?.textContent.trim() || "";
            const ps = el.querySelectorAll("p");
            const shortDesc = ps[0]?.textContent.trim() || "";
            const longDesc = ps[1]?.textContent.trim() || "";

            result.Features.push({
              index,
              src: img,
              title: h4,
              "short-description": shortDesc,
              "long-description": longDesc,
            });
          });
        }

        // 3. Videos
        const video = document.getElementById("video_product");
        result.Videos = {
          "main-video": video?.src || video?.querySelector("source")?.src || "",
        };

        // 4. FAQ
        const faqWrappers = Array.from(document.querySelectorAll(".faq-wrapper"));
        result.FAQ = faqWrappers.map((el) => ({
          question: el.querySelector(".accordian-title")?.textContent.trim() || "",
          answer: el.querySelector(".panel.accordian-body")?.textContent.trim() || "",
        }));

        // 5. CareNInfo
        const mainImg = document.querySelector(
          "img.sc-care-img.care-desk-banner.lazy.entered.loaded"
        )?.src || "";

        const modalImg = document.querySelector("div.modal-content img")?.src || "";

        result.CareNInfo = {
          "main-image": mainImg,
          "more-info-image": modalImg,
        };

        // 6. SimilarProductSlider
        const sliderAnchors = Array.from(
          document.querySelectorAll("#sc-recom-product_new-ui .ProductItem_media a")
        );
        result.SimilarProductSlider = sliderAnchors.map((a) => ({
          href: a.href,
        }));

        return result;
      });

      output[handle] = data;
    } catch (err) {
      console.error(`❌ Error scraping ${handle}:`, err.message);
      output[handle] = {
        Advantages: [],
        Features: [],
        Videos: { "main-video": "" },
        FAQ: [],
        CareNInfo: { "main-image": "", "more-info-image": "" },
        SimilarProductSlider: [],
      };
    }
  }

  await browser.close();

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log("✅ All data saved to productDetails.json");
})();