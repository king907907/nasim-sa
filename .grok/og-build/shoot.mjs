import { chromium } from "playwright-core";
import { pathToFileURL } from "node:url";

const executablePath =
  "/opt/pw-browsers/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell";

const browser = await chromium.launch({
  executablePath,
  args: ["--no-sandbox", "--disable-gpu", "--font-render-hinting=medium"],
});
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 2,
});
await page.goto(pathToFileURL("/workspace/.grok/og-build/card.html").href, {
  waitUntil: "load",
});
await page.evaluate(() => document.fonts.ready);
const text = await page.locator("h1").innerText();
const box = await page.locator("h1").boundingBox();
console.log(JSON.stringify({ text, box }));
await page.screenshot({
  path: "/workspace/.grok/og-build/card.png",
  type: "png",
  clip: { x: 0, y: 0, width: 1200, height: 630 },
});
await browser.close();
