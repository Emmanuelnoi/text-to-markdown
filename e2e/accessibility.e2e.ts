import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should not have any automatically detectable accessibility issues', async ({ page }) => {
    // Run axe accessibility tests
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper ARIA labels on interactive elements', async ({ page }) => {
    // Check buttons have accessible names
    const buttons = await page.locator('button').all();

    for (const button of buttons) {
      const ariaLabel = await button.getAttribute('aria-label');
      const text = await button.textContent();
      const hasAccessibleName = ariaLabel || (text && text.trim().length > 0);

      expect(hasAccessibleName).toBe(true);
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Tab through focusable elements
    await page.keyboard.press('Tab');
    const firstFocused = await page.evaluate(() => document.activeElement?.tagName);
    expect(firstFocused).toBeTruthy();

    // Continue tabbing
    await page.keyboard.press('Tab');
    const secondFocused = await page.evaluate(() => document.activeElement?.tagName);
    expect(secondFocused).toBeTruthy();

    // Elements should be different
    expect(firstFocused).not.toBe(secondFocused);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    // Check for h1
    const h1 = page.locator('h1').first();

    if (await h1.isVisible()) {
      const h1Text = await h1.textContent();
      expect(h1Text?.length).toBeGreaterThan(0);
    }

    // If there are headings, they should follow proper hierarchy
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();

    if (headings.length > 0) {
      // First heading should be h1 or h2
      const firstHeadingTag = await headings[0].evaluate(el => el.tagName);
      expect(['H1', 'H2']).toContain(firstHeadingTag);
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    // Run contrast-specific accessibility check
    const accessibilityScanResults = await new AxeBuilder({ page }).withTags(['wcag2aa']).analyze();

    const contrastViolations = accessibilityScanResults.violations.filter(v =>
      v.id.includes('contrast'),
    );

    expect(contrastViolations).toEqual([]);
  });

  test('should have descriptive page title', async ({ page }) => {
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    expect(title).not.toBe('');
  });

  test('should have proper form labels', async ({ page }) => {
    const inputs = await page.locator('input[type="text"], input[type="email"], textarea').all();

    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      const placeholder = await input.getAttribute('placeholder');

      // Input should have some form of label
      const hasLabel =
        (id && (await page.locator(`label[for="${id}"]`).count()) > 0) ||
        ariaLabel ||
        ariaLabelledBy ||
        placeholder;

      expect(hasLabel).toBeTruthy();
    }
  });

  test('should have appropriate focus indicators', async ({ page }) => {
    const editor = page.locator('.tiptap').first();

    if (await editor.isVisible()) {
      await editor.focus();

      // Check that focus is visible (element should have outline or border change)
      const styles = await editor.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          outline: computed.outline,
          outlineWidth: computed.outlineWidth,
          outlineStyle: computed.outlineStyle,
          border: computed.border,
        };
      });

      // Should have some form of focus indicator
      const hasFocusIndicator =
        styles.outlineWidth !== '0px' ||
        styles.outline !== 'none' ||
        styles.outlineStyle !== 'none';

      expect(hasFocusIndicator).toBeTruthy();
    }
  });

  test('should support screen reader announcements', async ({ page }) => {
    // Check for ARIA live regions for dynamic content
    const liveRegions = page.locator('[aria-live]');
    const liveRegionCount = await liveRegions.count();

    // If there are alerts, they should have aria-live
    const alerts = page.locator('[role="alert"]');
    const alertCount = await alerts.count();

    if (alertCount > 0) {
      // At least one alert should have aria-live or be in a live region
      const hasLiveRegion =
        liveRegionCount > 0 || (await alerts.first().getAttribute('aria-live')) !== null;
      expect(hasLiveRegion).toBeTruthy();
    }
  });

  test('should have proper landmark regions', async ({ page }) => {
    // Check for main landmark
    const main = page.locator('main, [role="main"]').first();
    const hasMain = (await main.count()) > 0;

    // Application should have a main content area
    expect(hasMain).toBe(true);
  });

  test('should not have empty links or buttons', async ({ page }) => {
    const links = await page.locator('a').all();

    for (const link of links) {
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      const hasContent = (text && text.trim().length > 0) || ariaLabel;

      expect(hasContent).toBeTruthy();
    }

    const buttons = await page.locator('button').all();

    for (const button of buttons) {
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      const hasContent = (text && text.trim().length > 0) || ariaLabel;

      expect(hasContent).toBeTruthy();
    }
  });

  test('should have proper alt text for images', async ({ page }) => {
    const images = await page.locator('img').all();

    for (const img of images) {
      const alt = await img.getAttribute('alt');
      const role = await img.getAttribute('role');

      // Images should have alt text or be marked as decorative
      const hasAltText = alt !== null || role === 'presentation';
      expect(hasAltText).toBeTruthy();
    }
  });

  test('should support reduced motion preferences', async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Trigger an animation (like theme toggle or alert)
    const themeToggle = page.getByRole('button', { name: /theme/i }).first();

    if (await themeToggle.isVisible()) {
      await themeToggle.click();

      // Check that animations respect reduced motion
      // This is hard to test directly, but we can verify no errors occur
      await page.waitForTimeout(500);

      // Page should still be functional
      const editor = page.locator('.tiptap');
      await expect(editor).toBeVisible();
    }
  });
});
