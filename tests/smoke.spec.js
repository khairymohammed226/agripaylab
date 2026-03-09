import { test, expect } from '@playwright/test';

test('dashboard loads', async ({ page }) => {

  // نحط البيانات قبل ما الصفحة تفتح
  await page.addInitScript(() => {
    localStorage.setItem("currentUser", JSON.stringify({
      _id: "699a7bfb63eee406c5c329a8"
    }));

    localStorage.setItem("token", "fake-test-token");
  });

  await page.goto('/dashboard.html');

  await expect(page.locator('.navbar')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('.sidebar')).toBeVisible({ timeout: 10000 });

});