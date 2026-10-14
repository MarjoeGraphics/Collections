import { test, expect } from '@playwright/test';

test('Verify editorial banner and expandable case study with image fallbacks', async ({ page }) => {
    await page.goto('http://localhost:8000/index.html');
    await page.waitForTimeout(1000);

    // Scroll to #work
    await page.locator('#work').scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);

    // Take screenshot of collapsed banners
    await page.screenshot({ path: '/home/jules/verification/screenshots/verification_banners_collapsed.png' });

    // Click on the first "Explore Case Study" button
    const firstToggle = page.locator('.toggle-case-study-btn').first();
    await expect(firstToggle).toBeVisible();
    await firstToggle.click();
    await page.waitForTimeout(1000);

    // Take screenshot of expanded case study with gallery grid
    await page.screenshot({ path: '/home/jules/verification/screenshots/verification_banner_expanded.png' });
});
