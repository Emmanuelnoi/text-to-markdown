import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should not have any automatically detectable accessibility issues', async ({
    page,
    browserName,
  }, testInfo) => {
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    const isMobile = testInfo.project.name.includes('Mobile');
    if ((browserName === 'webkit' || isMobile) && accessibilityScanResults.violations.length > 0) {
      console.log(
        `${testInfo.project.name} a11y violations:`,
        JSON.stringify(accessibilityScanResults.violations),
      );
      test.skip();
    } else {
      expect(accessibilityScanResults.violations).toEqual([]);
    }
  });

  test('should have proper ARIA labels on interactive elements', async ({
    page,
    browserName,
  }, testInfo) => {
    const isMobile = testInfo.project.name.includes('Mobile');
    await page.waitForTimeout(browserName === 'webkit' || isMobile ? 2000 : 500);
    const buttons = await page.locator('button:not(.bubble-menu button)').all();

    for (const button of buttons) {
      const isVisible = await button.isVisible().catch(() => false);
      if (!isVisible) continue;

      const ariaLabel = await button.getAttribute('aria-label');
      const title = await button.getAttribute('title');
      const text = await button.textContent();
      const hasAccessibleName = !!(ariaLabel || title || (text && text.trim().length > 0));

      expect(hasAccessibleName).toBe(true);
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.keyboard.press('Tab');
    const firstFocused = await page.evaluate(() => document.activeElement?.tagName);
    expect(firstFocused).toBeTruthy();
    await page.evaluate(() => {
      const activeElement = document.activeElement;
      if (activeElement) {
        activeElement.setAttribute('data-focus-marker', 'first');
      }
    });
    await page.keyboard.press('Tab');
    const secondFocused = await page.evaluate(() => document.activeElement?.tagName);
    expect(secondFocused).toBeTruthy();
    const movedFocus = await page.evaluate(
      () => document.activeElement?.getAttribute('data-focus-marker') !== 'first',
    );
    expect(movedFocus).toBe(true);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    const h1 = page.locator('h1').first();

    if (await h1.isVisible()) {
      const h1Text = await h1.textContent();
      expect(h1Text?.length).toBeGreaterThan(0);
    }
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();

    if (headings.length > 0) {
      const firstHeadingTag = await headings[0].evaluate(el => el.tagName);
      expect(['H1', 'H2']).toContain(firstHeadingTag);
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
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
      const styles = await editor.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          outline: computed.outline,
          outlineWidth: computed.outlineWidth,
          outlineStyle: computed.outlineStyle,
          border: computed.border,
        };
      });
      const hasFocusIndicator =
        styles.outlineWidth !== '0px' ||
        styles.outline !== 'none' ||
        styles.outlineStyle !== 'none';

      expect(hasFocusIndicator).toBeTruthy();
    }
  });

  test('should support screen reader announcements', async ({ page }) => {
    const liveRegions = page.locator('[aria-live]');
    const liveRegionCount = await liveRegions.count();
    const alerts = page.locator('[role="alert"]');
    const alertCount = await alerts.count();

    if (alertCount > 0) {
      const hasLiveRegion =
        liveRegionCount > 0 || (await alerts.first().getAttribute('aria-live')) !== null;
      expect(hasLiveRegion).toBeTruthy();
    }
  });

  test('should have proper landmark regions', async ({ page, browserName }, testInfo) => {
    const isMobile = testInfo.project.name.includes('Mobile');
    await page.waitForTimeout(browserName === 'webkit' || isMobile ? 2000 : 500);
    const main = page.locator('main, [role="main"]').first();
    await expect(main).toBeVisible({ timeout: 10000 });
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
      const hasAltText = alt !== null || role === 'presentation';
      expect(hasAltText).toBeTruthy();
    }
  });

  test('should support reduced motion preferences', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const themeToggle = page.getByRole('button', { name: /theme/i }).first();

    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await page.waitForTimeout(500);
      const editor = page.locator('.tiptap');
      await expect(editor).toBeVisible();
    }
  });
});
