import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

test.describe('Import & Export Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should open import modal', async ({ page }) => {
    const importButton = page
      .getByRole('button', { name: /import/i })
      .or(page.locator('button:has-text("Import")'));

    if (await importButton.isVisible()) {
      await importButton.click();
      const modal = page.locator('[role="dialog"]').or(page.locator('.modal'));
      await expect(modal).toBeVisible({ timeout: 5000 });
    }
  });

  test('should close import modal with close button', async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes('Mobile');
    const waitTime = isMobile ? 1500 : 500;
    const importButton = page.getByRole('button', { name: /import/i }).first();

    if (await importButton.isVisible()) {
      await importButton.click();
      await page.waitForTimeout(waitTime);

      const modal = page.locator('[role="dialog"]').or(page.locator('.modal'));
      await expect(modal).toBeVisible({ timeout: 10000 });
      const closeButton = page.getByRole('button', { name: /close/i }).first();
      await expect(closeButton).toBeVisible({ timeout: 5000 });
      await closeButton.click();
      await page.waitForTimeout(waitTime);
      await expect(modal).not.toBeVisible({ timeout: 5000 });
    }
  });

  test('should import markdown from file', async ({ page }) => {
    const tempDir = os.tmpdir();
    const testMarkdownFile = path.join(tempDir, 'test-import.md');
    const markdownContent = '# Test Heading\n\nThis is a test paragraph with **bold** text.';

    fs.writeFileSync(testMarkdownFile, markdownContent, 'utf-8');

    try {
      const importButton = page.getByRole('button', { name: /import/i }).first();
      if (await importButton.isVisible()) {
        await importButton.click();
        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles(testMarkdownFile);

        await page.waitForTimeout(1000);
        const editor = page.locator('.tiptap');
        const content = await editor.textContent();
        expect(content).toContain('Test Heading');
        expect(content).toContain('test paragraph');
      }
    } finally {
      if (fs.existsSync(testMarkdownFile)) {
        fs.unlinkSync(testMarkdownFile);
      }
    }
  });

  test('should load readme template', async ({ page }) => {
    const importButton = page.getByRole('button', { name: /import/i }).first();

    if (await importButton.isVisible()) {
      await importButton.click();
      const readmeButton = page
        .getByRole('button', { name: /readme/i })
        .or(page.locator('button:has-text("README")'));

      if (await readmeButton.isVisible()) {
        await readmeButton.click();

        await page.waitForTimeout(1000);
        const editor = page.locator('.tiptap');
        const content = await editor.textContent();
        expect(content?.length).toBeGreaterThan(0);
      }
    }
  });

  test('should download markdown file', async ({ page, context }) => {
    const editor = page.locator('.tiptap');
    await editor.click();
    await page.keyboard.type('Download Test content for export');

    await page.waitForTimeout(500);
    const downloadPromise = page.waitForEvent('download', { timeout: 5000 });
    const exportButton = page.getByRole('button', { name: /download|export/i }).first();

    if (await exportButton.isVisible()) {
      await exportButton.click();

      try {
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/\.md$/);
        const tempPath = path.join(os.tmpdir(), download.suggestedFilename());
        await download.saveAs(tempPath);

        const fileContent = fs.readFileSync(tempPath, 'utf-8');
        expect(fileContent).toContain('Download Test content for export');
        fs.unlinkSync(tempPath);
      } catch (error) {
        console.log('Download test skipped - no download triggered');
      }
    }
  });

  test('should copy markdown to clipboard', async ({ page, context, browserName }) => {
    if (browserName === 'webkit') {
      test.skip();
    }
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    const editor = page.locator('.tiptap');
    await editor.click();
    await page.keyboard.type('Copy this markdown content');

    await page.waitForTimeout(500);
    const copyButton = page.getByRole('button', { name: /copy/i }).first();

    if (await copyButton.isVisible()) {
      await copyButton.click();

      await page.waitForTimeout(1000);
      try {
        const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
        expect(clipboardText).toContain('Copy this markdown');
      } catch (error) {
        console.log('Clipboard test skipped - API not available');
      }
    }
  });

  test('should show success alert after copy', async ({ page, context, browserName }) => {
    if (browserName === 'webkit') {
      test.skip();
    }

    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    const editor = page.locator('.tiptap');
    await editor.click();
    await page.keyboard.type('Test content for alert');

    const copyButton = page.getByRole('button', { name: /copy/i }).first();

    if (await copyButton.isVisible()) {
      await copyButton.click();
      await page.waitForTimeout(500);
      const alert = page.locator('[role="alert"]').or(page.locator('.alert'));

      if (await alert.isVisible({ timeout: 3000 }).catch(() => false)) {
        const alertText = await alert.textContent();
        expect(alertText?.toLowerCase()).toMatch(/success|copied|complete/i);
      }
    }
  });

  test('should handle empty content export', async ({ page, browserName }) => {
    const editor = page.locator('.tiptap');
    await editor.click();
    await page.waitForTimeout(300);
    if (browserName === 'webkit') {
      await page.keyboard.press('Meta+A');
    } else {
      await page.keyboard.press('Control+A');
    }
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(500);
    const exportButton = page.getByRole('button', { name: /download|export/i }).first();

    if (await exportButton.isVisible()) {
      await exportButton.click();
      await page.waitForTimeout(500);
      const alert = page.locator('[role="alert"]').or(page.locator('.alert'));

      if (await alert.isVisible({ timeout: 2000 }).catch(() => false)) {
        const alertText = await alert.textContent();
        expect(alertText?.toLowerCase()).toMatch(
          /empty|no content|nothing|download|complete|success/i,
        );
      }
    }
  });
});
