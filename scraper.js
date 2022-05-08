const fs = require("fs");
const Axios = require("axios");
const puppeteer = require("puppeteer");
const { Cluster } = require("puppeteer-cluster");

// CHANGE THIS TO WHATEVER AMAZON PRODUCT URL YOU WANT TO DOWNLOAD IMAGES FROM
const URL_TO_DOWNLOAD =
  "https://www.amazon.es/DECORACI%C3%93N-INTERIORES-excelente-cubrici%C3%B3n-perfecto/dp/B086VPFQTJ/";

const scrapeProduct = async (url) => {
  // Viewport && Window size (only for non-headless)
  const width = 400;
  const height = 600;

  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 1,
    puppeteer,
    puppeteerOptions: {
      headless: false,
      deviceScaleFactor: 3,
      timeout: 60000,
      height,
      width,
    },
  });

  await cluster.task(async ({ page, data: url }) => {
    console.log("Starting web browser...");

    await page.goto(url, { waitUntil: "domcontentloaded" }).catch((e) => {
      console.error(e.message, `Failed goto. Url: ${url}`);
    });

    const cookiesAccept = await page.waitForXPath('//*[@id="sp-cc-accept"]');
    await cookiesAccept.click();

    const [expander] = await page.$x(
      '//*[@id="inline-twister-expander-content-color_name"]/div/div/a'
    );

    try {
      await expander.evaluate((b) => b.click());
    } catch (error) {}

    const variants = await page.$x("//*[contains(@id,'color_name_')]");

    for (let variant of variants) {
      await variant.evaluate((b) => b.click());
      await page.waitForSelector(
        ".image.item.itemNo0.maintain-height.selected"
      );

      try {
        const mainImage = await page.waitForSelector(
          "#main-image-container > ul > li.image.item.itemNo0.maintain-height > span > span > div > img"
        );

        const srcText = await mainImage.evaluate((el) => {
          console.log(el.getAttribute("src"));
          return el.getAttribute("src");
        });

        await downloadImage(srcText, "images/" + srcText.match(/([^\/]+$)/gm))
          .then(console.log(`Downloaded url ${srcText} to file`))
          .catch(console.error);
      } catch (err) {}
    }
  });

  cluster.queue(url);
  await cluster.idle();
  await cluster.close();
};

async function downloadImage(url, filepath) {
  const response = await Axios({
    url,
    method: "GET",
    responseType: "stream",
  });
  return new Promise((resolve, reject) => {
    response.data
      .pipe(fs.createWriteStream(filepath))
      .on("error", reject)
      .once("close", () => resolve(filepath));
  });
}

// const waitFor = (delay) => {
//   return new Promise((resolve) => setTimeout(resolve, delay));
// };

//RUN
scrapeProduct(URL_TO_DOWNLOAD);
