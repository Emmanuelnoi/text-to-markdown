import { test, expect } from '@playwright/test';

test.describe('Theme & UI Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should toggle dark mode', async ({ page }) => {
    // Find theme toggle button
    const themeToggle = page
      .getByRole('button', { name: /theme|dark|light/i })
      .or(page.locator('button[aria-label*="theme" i]'));

    if (await themeToggle.isVisible()) {
      // Get initial theme
      const htmlElement = page.locator('html');
      const initialClass = await htmlElement.getAttribute('class');

      // Toggle theme
      await themeToggle.click();
      await page.waitForTimeout(300);

      // Check theme changed
      const newClass = await htmlElement.getAttribute('class');
      expect(newClass).not.toBe(initialClass);

      // Theme should toggle between light and dark
      const hasDarkMode = initialClass?.includes('dark') || newClass?.includes('dark');
      expect(hasDarkMode).toBe(true);
    }
  });

  test('should persist theme preference on reload', async ({ page }) => {
    const themeToggle = page
      .getByRole('button', { name: /theme|dark|light/i })
      .or(page.locator('button[aria-label*="theme" i]'));

    if (await themeToggle.isVisible()) {
      // Set to dark mode
      await themeToggle.click();
      await page.waitForTimeout(300);

      const htmlElement = page.locator('html');
      const themeBeforeReload = await htmlElement.getAttribute('class');

      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Check theme persisted
      const themeAfterReload = await htmlElement.getAttribute('class');
      expect(themeAfterReload).toBe(themeBeforeReload);
    }
  });

  test('should show help/guide section', async ({ page }) => {
    // Look for help button
    const helpButton = page
      .getByRole('button', { name: /help|guide|\?/i })
      .or(page.locator('button:has-text("Help"), button:has-text("Guide")'));

    const isVisible = await helpButton.isVisible().catch(() => false);
    if (isVisible) {
      await helpButton.click();
      await page.waitForTimeout(500);

      // Check help content is visible
      const helpSection = page.locator('[role="dialog"]').or(page.locator('.help, .guide'));

      await expect(helpSection).toBeVisible({ timeout: 3000 });
    } else {
      test.skip();
    }
  });

  test('should close help section', async ({ page }) => {
    const helpButton = page.getByRole('button', { name: /help|guide/i }).first();

    if (await helpButton.isVisible()) {
      await helpButton.click();

      const helpSection = page.locator('[role="dialog"]').or(page.locator('.help, .guide'));

      if (await helpSection.isVisible({ timeout: 2000 })) {
        // Close help
        const closeButton = page.getByRole('button', { name: /close/i }).first();
        await closeButton.click();

        await expect(helpSection).not.toBeVisible();
      }
    }
  });

  test('should display alerts correctly', async ({ page }) => {
    // Trigger an action that shows an alert
    const editor = page.locator('.tiptap');
    await editor.click();
    await editor.fill('Test content');

    const copyButton = page.getByRole('button', { name: /copy/i }).first();

    if (await copyButton.isVisible()) {
      await copyButton.click();

      // Check alert appears
      const alert = page.locator('[role="alert"]').or(page.locator('.alert')).first();

      if (await alert.isVisible({ timeout: 2000 }).catch(() => false)) {
        // Alert should have proper styling
        const alertClasses = await alert.getAttribute('class');
        expect(alertClasses).toBeTruthy();

        // Alert should have title and message
        const alertText = await alert.textContent();
        expect(alertText?.length).toBeGreaterThan(0);
      }
    }
  });

  test('should close alerts manually', async ({ page }) => {
    // Trigger an alert
    const editor = page.locator('.tiptap');
    await editor.click();
    await editor.fill('Content');

    const copyButton = page.getByRole('button', { name: /copy/i }).first();

    if (await copyButton.isVisible()) {
      await copyButton.click();

      const alert = page.locator('[role="alert"]').or(page.locator('.alert')).first();

      if (await alert.isVisible({ timeout: 2000 }).catch(() => false)) {
        // Find close button in alert
        const closeButton = alert.locator('button').first();

        if (await closeButton.isVisible()) {
          await closeButton.click();

          // Alert should disappear
          await expect(alert).not.toBeVisible({ timeout: 2000 });
        }
      }
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check main elements are still visible and functional
    const editor = page.locator('.tiptap');
    await expect(editor).toBeVisible();

    // Editor should be usable
    await editor.click();
    await page.keyboard.type('Mobile test');

    const content = await editor.textContent();
    expect(content).toContain('Mobile test');
  });

  test('should be responsive on tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const editor = page.locator('.tiptap');
    await expect(editor).toBeVisible();

    // All main features should be accessible
    await editor.click();
    await page.keyboard.type('Tablet test');

    expect(await editor.textContent()).toContain('Tablet test');
  });

  test('should handle keyboard shortcuts', async ({ page }) => {
    const editor = page.locator('.tiptap');
    await editor.click();

    // Test Ctrl+B (Bold)
    await page.keyboard.type('Bold text');
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Control+B');

    await page.waitForTimeout(300);

    const bold = editor.locator('strong, b');
    await expect(bold).toBeVisible();

    // Clear and test Ctrl+I (Italic)
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.type('Italic text');
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Control+I');

    await page.waitForTimeout(300);

    const italic = editor.locator('em, i');
    await expect(italic).toBeVisible();
  });

  test('should show appropriate cursor states', async ({ page, browserName }) => {
    // Check buttons have pointer cursor
    const buttons = page.locator('button').first();

    if (await buttons.isVisible()) {
      const cursor = await buttons.evaluate(el => window.getComputedStyle(el).cursor);
      // WebKit doesn't always apply cursor: pointer to buttons by default
      if (browserName === 'webkit') {
        expect(['pointer', 'default']).toContain(cursor);
      } else {
        expect(cursor).toBe('pointer');
      }
    }
  });

  test('should handle focus states correctly', async ({ page }) => {
    const editor = page.locator('.tiptap');

    // Focus editor
    await editor.focus();

    // Check editor has focus
    const isFocused = await editor.evaluate(
      el => document.activeElement === el || el.contains(document.activeElement),
    );
    expect(isFocused).toBe(true);
  });

  test('should maintain state during navigation', async ({ page }) => {
    const editor = page.locator('.tiptap');
    await editor.click();
    await editor.fill('Persistent content');

    // Get current content
    const initialContent = await editor.textContent();

    // Interact with other UI elements
    const themeToggle = page.getByRole('button', { name: /theme/i }).first();
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await page.waitForTimeout(300);
    }

    // Content should persist
    const afterContent = await editor.textContent();
    expect(afterContent).toBe(initialContent);
  });
});
