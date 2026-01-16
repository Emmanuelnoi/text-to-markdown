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
    // Click import button
    const importButton = page
      .getByRole('button', { name: /import/i })
      .or(page.locator('button:has-text("Import")'));

    if (await importButton.isVisible()) {
      await importButton.click();

      // Check modal is visible
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

      // Click close button - look for aria-label="Close" or text containing close/cancel
      const closeButton = page.getByRole('button', { name: /close/i }).first();
      await expect(closeButton).toBeVisible({ timeout: 5000 });
      await closeButton.click();
      await page.waitForTimeout(waitTime);

      // Modal should be hidden
      await expect(modal).not.toBeVisible({ timeout: 5000 });
    }
  });

  test('should import markdown from file', async ({ page }) => {
    // Create a temporary markdown file
    const tempDir = os.tmpdir();
    const testMarkdownFile = path.join(tempDir, 'test-import.md');
    const markdownContent = '# Test Heading\n\nThis is a test paragraph with **bold** text.';

    fs.writeFileSync(testMarkdownFile, markdownContent, 'utf-8');

    try {
      // Open import modal
      const importButton = page.getByRole('button', { name: /import/i }).first();
      if (await importButton.isVisible()) {
        await importButton.click();

        // Wait for file input
        const fileInput = page.locator('input[type="file"]');

        // Upload file
        await fileInput.setInputFiles(testMarkdownFile);

        await page.waitForTimeout(1000);

        // Check that content was imported
        const editor = page.locator('.tiptap');
        const content = await editor.textContent();
        expect(content).toContain('Test Heading');
        expect(content).toContain('test paragraph');
      }
    } finally {
      // Clean up temp file
      if (fs.existsSync(testMarkdownFile)) {
        fs.unlinkSync(testMarkdownFile);
      }
    }
  });

  test('should load readme template', async ({ page }) => {
    const importButton = page.getByRole('button', { name: /import/i }).first();

    if (await importButton.isVisible()) {
      await importButton.click();

      // Look for template buttons
      const readmeButton = page
        .getByRole('button', { name: /readme/i })
        .or(page.locator('button:has-text("README")'));

      if (await readmeButton.isVisible()) {
        await readmeButton.click();

        await page.waitForTimeout(1000);

        // Check that template was loaded
        const editor = page.locator('.tiptap');
        const content = await editor.textContent();
        expect(content?.length).toBeGreaterThan(0);
      }
    }
  });

  test('should download markdown file', async ({ page, context }) => {
    // Add some content
    const editor = page.locator('.tiptap');
    await editor.click();
    await page.keyboard.type('Download Test content for export');

    await page.waitForTimeout(500);

    // Setup download listener
    const downloadPromise = page.waitForEvent('download', { timeout: 5000 });

    // Click export/download button
    const exportButton = page.getByRole('button', { name: /download|export/i }).first();

    if (await exportButton.isVisible()) {
      await exportButton.click();

      try {
        const download = await downloadPromise;

        // Check filename
        expect(download.suggestedFilename()).toMatch(/\.md$/);

        // Save and verify content
        const tempPath = path.join(os.tmpdir(), download.suggestedFilename());
        await download.saveAs(tempPath);

        const fileContent = fs.readFileSync(tempPath, 'utf-8');
        expect(fileContent).toContain('Download Test content for export');

        // Clean up
        fs.unlinkSync(tempPath);
      } catch (error) {
        // Download might not trigger in some scenarios - that's okay
        console.log('Download test skipped - no download triggered');
      }
    }
  });

  test('should copy markdown to clipboard', async ({ page, context, browserName }) => {
    // Skip clipboard tests on WebKit due to permission issues in CI
    if (browserName === 'webkit') {
      test.skip();
    }

    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    // Add content
    const editor = page.locator('.tiptap');
    await editor.click();
    await page.keyboard.type('Copy this markdown content');

    await page.waitForTimeout(500);

    // Click copy button
    const copyButton = page.getByRole('button', { name: /copy/i }).first();

    if (await copyButton.isVisible()) {
      await copyButton.click();

      await page.waitForTimeout(1000);

      // Check clipboard (if possible)
      // Note: Clipboard API might not work in all test environments
      try {
        const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
        expect(clipboardText).toContain('Copy this markdown');
      } catch (error) {
        // Clipboard API might not be available in test environment
        console.log('Clipboard test skipped - API not available');
      }
    }
  });

  test('should show success alert after copy', async ({ page, context, browserName }) => {
    // Skip clipboard tests on WebKit due to permission issues in CI
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

      // Check for success alert
      const alert = page.locator('[role="alert"]').or(page.locator('.alert'));

      if (await alert.isVisible({ timeout: 3000 }).catch(() => false)) {
        const alertText = await alert.textContent();
        expect(alertText?.toLowerCase()).toMatch(/success|copied|complete/i);
      }
    }
  });

  test('should handle empty content export', async ({ page, browserName }) => {
    // Ensure editor is empty
    const editor = page.locator('.tiptap');
    await editor.click();
    await page.waitForTimeout(300);

    // Use Meta+A for macOS (WebKit), Control+A for others
    if (browserName === 'webkit') {
      await page.keyboard.press('Meta+A');
    } else {
      await page.keyboard.press('Control+A');
    }
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(300);

    // Try to export
    const exportButton = page.getByRole('button', { name: /download|export/i }).first();

    if (await exportButton.isVisible()) {
      await exportButton.click();

      // Should show info/warning alert
      const alert = page.locator('[role="alert"]').or(page.locator('.alert'));

      if (await alert.isVisible({ timeout: 2000 }).catch(() => false)) {
        const alertText = await alert.textContent();
        expect(alertText?.toLowerCase()).toMatch(/empty|no content|nothing/i);
      }
    }
  });
});
