import { test, expect, Page } from '@playwright/test';

async function getShortcutModifier(page: Page): Promise<'Meta' | 'Control'> {
  const platform = await page.evaluate(() => navigator.platform);
  return /Mac|iPhone|iPad/i.test(platform) ? 'Meta' : 'Control';
}

test.describe('Markdown Conversion', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should load the application successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Markdown Converter/i);
    const editor = page.locator('.tiptap');
    await expect(editor).toBeVisible();
  });

  test('should convert rich text to markdown', async ({ page, browserName }, testInfo) => {
    const isMobile = testInfo.project.name.includes('Mobile');
    const waitTime = browserName === 'webkit' || isMobile ? 1500 : 500;
    const editor = page.locator('.tiptap');
    await editor.click();
    await page.waitForTimeout(isMobile ? 500 : 300);
    await page.keyboard.type('This is a test paragraph.');
    await page.waitForTimeout(waitTime);
    const convertButton = page.getByRole('button', { name: 'Convert', exact: true });
    await expect(convertButton).toBeVisible({ timeout: 5000 });
    await convertButton.click();
    await page.waitForTimeout(waitTime);
    const preview = page.locator('[data-testid="markdown-preview"]');
    await expect(preview).toBeVisible({ timeout: 10000 });
    const content = await preview.textContent();
    expect(content).toContain('This is a test');
  });

  test('should handle heading formatting', async ({ page }) => {
    const editor = page.locator('.tiptap');
    await editor.click();
    await page.keyboard.type('Heading Text');
    const modifier = await getShortcutModifier(page);
    await page.keyboard.press(`${modifier}+Alt+1`);

    await page.waitForTimeout(500);
    const heading = editor.locator('h1, h2, h3').first();
    await expect(heading).toBeVisible();
  });

  test('should handle bold text formatting', async ({ page }, testInfo) => {
    const projectName = testInfo?.project?.name || '';
    if (projectName.includes('Mobile') || projectName.includes('mobile')) {
      test.skip();
      return;
    }

    const editor = page.locator('.tiptap');
    await editor.click();
    await page.keyboard.type('Bold text');
    const modifier = await getShortcutModifier(page);
    await page.keyboard.press(`${modifier}+A`);
    await page.keyboard.press(`${modifier}+B`);

    await page.waitForTimeout(500);
    const bold = editor.locator('strong, b').first();
    await expect(bold).toBeVisible({ timeout: 5000 });
    expect(await bold.textContent()).toContain('Bold text');
  });

  test('should handle italic text formatting', async ({ page }, testInfo) => {
    const projectName = testInfo?.project?.name || '';
    if (projectName.includes('Mobile') || projectName.includes('mobile')) {
      test.skip();
      return;
    }

    const editor = page.locator('.tiptap');
    await editor.click();
    await page.keyboard.type('Italic text');
    const modifier = await getShortcutModifier(page);
    await page.keyboard.press(`${modifier}+A`);
    await page.keyboard.press(`${modifier}+I`);

    await page.waitForTimeout(500);
    const italic = editor.locator('em, i').first();
    await expect(italic).toBeVisible({ timeout: 5000 });
  });

  test('should create bullet lists', async ({ page }) => {
    const editor = page.locator('.tiptap');
    await editor.click();

    await page.keyboard.type('- First item');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Second item');

    await page.waitForTimeout(500);
    const list = editor.locator('ul');
    await expect(list).toBeVisible();

    const items = editor.locator('li');
    await expect(items).toHaveCount(2);
  });

  test('should create numbered lists', async ({ page }) => {
    const editor = page.locator('.tiptap');
    await editor.click();

    await page.keyboard.type('1. First item');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Second item');

    await page.waitForTimeout(500);
    const list = editor.locator('ol');
    await expect(list).toBeVisible();
  });

  test('should handle code blocks', async ({ page }) => {
    const editor = page.locator('.tiptap');
    await editor.click();
    await page.keyboard.type('```javascript');
    await page.keyboard.press('Enter');
    await page.keyboard.type('const hello = "world";');
    await page.keyboard.press('Enter');
    await page.keyboard.type('```');

    await page.waitForTimeout(500);
    const codeBlock = editor.locator('pre, code').first();
    await expect(codeBlock).toBeVisible();
  });

  test('should clear content when clear button is clicked', async ({ page }) => {
    const editor = page.locator('.tiptap');
    await editor.click();
    await page.keyboard.type('Content to clear');
    const clearButton = page
      .getByRole('button', { name: /clear/i })
      .or(page.locator('button:has-text("Clear")'));

    if (await clearButton.isVisible()) {
      await clearButton.click();
      const confirmButton = page.getByRole('button', { name: /confirm|yes|ok/i });
      if (await confirmButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await confirmButton.click();
      }
      const content = await editor.textContent();
      expect(content?.trim()).toBe('');
    }
  });

  test('should maintain formatting across multiple edits', async ({ page }, testInfo) => {
    const projectName = testInfo?.project?.name || '';
    if (projectName.includes('Mobile') || projectName.includes('mobile')) {
      test.skip();
      return;
    }

    const editor = page.locator('.tiptap');
    await editor.click();
    const modifier = await getShortcutModifier(page);
    await page.keyboard.type('Regular text ');
    await page.keyboard.press(`${modifier}+B`);
    await page.keyboard.type('bold');
    await page.keyboard.press(`${modifier}+B`);
    await page.keyboard.type(' and ');
    await page.keyboard.press(`${modifier}+I`);
    await page.keyboard.type('italic');

    await page.waitForTimeout(500);
    await expect(editor.locator('strong, b')).toBeVisible({ timeout: 5000 });
    await expect(editor.locator('em, i')).toBeVisible({ timeout: 5000 });
  });
});
