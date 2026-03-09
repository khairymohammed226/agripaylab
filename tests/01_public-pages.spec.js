import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";
import { readSeed, setCurrentUserLocalStorage } from "./helpers.mjs";

const AUTH_PAGES = new Set([
  "dashboard.html",
  "bank.html",
  "card.html",
  "profile.html",
  "wallet.html",
  "atm.html"
]);

test("open all public HTML pages (smoke)", async ({ page }) => {
  const seed = readSeed();

  const publicDir = path.join(process.cwd(), "public");
  const files = fs
    .readdirSync(publicDir)
    .filter((f) => f.toLowerCase().endsWith(".html"));

  expect(files.length).toBeGreaterThan(0);

  for (const f of files) {
    if (AUTH_PAGES.has(f)) {
      await setCurrentUserLocalStorage(page, { _id: seed.userA._id });
    } else {
      // Guest mode
      await page.addInitScript(() => localStorage.removeItem("currentUser"));
    }

    const resp = await page.goto(`/${f}`, { waitUntil: "domcontentloaded" });

    // لو فيه صفحة مش موجودة/مش بتتخدم هتفشل هنا
    expect(resp.status(), `${f} returned ${resp.status()}`).toBeLessThan(400);

    // Check page didn't render Express error
    await expect(page.locator("text=Cannot GET")).toHaveCount(0);
  }
});