import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });

async function check(label) {
  const metrics = await page.evaluate(() => {
    const stage = document.querySelector(".ebook-stage");
    const frame = document.querySelector(".ebook-fit-frame");
    const scale = document.querySelector(".ebook-fit-scale");
    const bookPage = document.querySelector(".book-page");
    const sheet = document.querySelector(".game-sheet, .design-sheet, .web-sheet");
    const fr = frame ? frame.getBoundingClientRect() : null;
    const sr = stage ? stage.getBoundingClientRect() : null;
    const pr = bookPage ? bookPage.getBoundingClientRect() : null;
    const tr = scale ? getComputedStyle(scale).transform : null;
    const pageFillsFrame = !!(
      fr &&
      pr &&
      Math.abs(pr.width - fr.width) <= 3 &&
      Math.abs(pr.height - fr.height) <= 4 &&
      Math.abs(pr.left - fr.left) <= 2 &&
      Math.abs(pr.top - fr.top) <= 2
    );
    return {
      stage: sr && { w: Math.round(sr.width), h: Math.round(sr.height) },
      frame: fr && {
        w: Math.round(fr.width),
        h: Math.round(fr.height),
      },
      page: pr && {
        w: Math.round(pr.width),
        h: Math.round(pr.height),
      },
      sheet: sheet
        ? {
            w: Math.round(sheet.getBoundingClientRect().width),
            h: Math.round(sheet.getBoundingClientRect().height),
          }
        : null,
      transform: tr,
      overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
      frameVisible: !!(fr && fr.width > 40 && fr.height > 40),
      ratio: fr && fr.height ? +(fr.width / fr.height).toFixed(3) : null,
      fitsStage: !!(fr && sr && fr.width <= sr.width + 2 && fr.height <= sr.height + 2),
      pageFillsFrame,
      kind: bookPage ? [...bookPage.classList].find((c) => c.endsWith("-page")) : null,
    };
  });
  const scaled =
    metrics.transform &&
    metrics.transform !== "none" &&
    !/^matrix\(1(?:,\s*0){4}\)$/.test(metrics.transform.replace(/\s/g, ""));
  const isGame = metrics.kind === "game-page";
  const ok =
    metrics.frameVisible &&
    !metrics.overflowX &&
    metrics.fitsStage &&
    metrics.ratio >= 0.6 &&
    metrics.ratio <= 0.65 &&
    (!isGame || metrics.pageFillsFrame) &&
    (!isGame || (metrics.sheet?.w || 0) >= (metrics.page?.w || 0) - 4);
  console.log(label, ok ? "OK" : "FAIL", JSON.stringify({ ...metrics, scaled }));
  return ok;
}

let all = true;

await page.goto("http://127.0.0.1:4173/page/5", { waitUntil: "networkidle" });
await page.waitForTimeout(500);
all = (await check("direct /page/5")) && all;

for (let i = 0; i < 10; i += 1) {
  await page.getByRole("button", { name: /Trang sau/i }).click();
  await page.waitForTimeout(300);
  all = (await check(`next ${i + 1}`)) && all;
}

await page.setViewportSize({ width: 1920, height: 1080 });
await page.waitForTimeout(400);
all = (await check("1920x1080")) && all;

await page.setViewportSize({ width: 1280, height: 720 });
await page.waitForTimeout(400);
all = (await check("1280x720")) && all;

await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(400);
all = (await check("mobile 390")) && all;

await page.setViewportSize({ width: 1366, height: 768 });
await page.waitForTimeout(300);
await page.goto("http://127.0.0.1:4173/page/1", { waitUntil: "networkidle" });
await page.waitForTimeout(500);
all = (await check("page 1 design")) && all;

await page.goto("http://127.0.0.1:4173/page/6", { waitUntil: "networkidle" });
await page.waitForTimeout(500);
all = (await check("direct /page/6")) && all;

await page.goto("http://127.0.0.1:4173/page/29", { waitUntil: "networkidle" });
await page.waitForTimeout(500);
all = (await check("page 29")) && all;

console.log(all ? "ALL_PASS" : "ALL_FAIL");
await browser.close();
process.exit(all ? 0 : 1);
