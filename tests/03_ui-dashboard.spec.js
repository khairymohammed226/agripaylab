import { test, expect } from "@playwright/test";
import { readSeed, setCurrentUserLocalStorage } from "./helpers.mjs";

test("dashboard shows user data (UI)", async ({ page }) => {
  const seed = readSeed();

  await setCurrentUserLocalStorage(page, { _id: seed.userA._id });
  await page.addInitScript((user) => {
  localStorage.setItem('currentUser', JSON.stringify(user));
}, seed.userB);
  await page.goto("/dashboard.html", { waitUntil: "domcontentloaded" });

  await expect(page.locator(".navbar")).toBeVisible();
  await expect(page.locator(".sidebar")).toBeVisible();

  // IDs اللي عندك في dashboard
  await expect(page.locator("#fullname")).not.toHaveText("");
  await expect(page.locator("#balance")).not.toHaveText("");

  // transactions list should render boxes
  const count = await page.locator(".transaction-box").count();
expect(count).toBeGreaterThan(0);
});