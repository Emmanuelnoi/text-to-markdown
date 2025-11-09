import { test, expect } from '@playwright/test';

test.describe('Markdown Conversion', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should load the application successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Markdown Converter/i);

    // Check that main components are visible
    const editor = page.locator('.tiptap');
    await expect(editor).toBeVisible();
  });

  test('should convert rich text to markdown', async ({ page }) => {
    // Type some text in the rich text editor
    const editor = page.locator('.tiptap');
    await editor.click();
    await editor.fill('This is a test paragraph.');

    // Wait for conversion
    await page.waitForTimeout(500);

    // Check that markdown preview is updated
    const preview = page
      .locator('[data-testid="markdown-preview"]')
      .or(page.locator('.markdown-preview'));

    // The text should be converted to markdown
    const content = await preview.textContent();
    expect(content).toContain('This is a test');
  });

  test('should handle heading formatting', async ({ page }) => {
    const editor = page.locator('.tiptap');
    await editor.click();

    // Type and format as heading
    await page.keyboard.type('Heading Text');
    await page.keyboard.press('Control+Alt+1'); // or check for heading button

    await page.waitForTimeout(500);

    // Check heading is created
    const heading = editor.locator('h1, h2, h3').first();
    await expect(heading).toBeVisible();
  });

  test('should handle bold text formatting', async ({ page }) => {
    const editor = page.locator('.tiptap');
    await editor.click();
    await page.keyboard.type('Bold text');

    // Select all text
    await page.keyboard.press('Control+A');

    // Apply bold formatting (Ctrl+B)
    await page.keyboard.press('Control+B');

    await page.waitForTimeout(500);

    // Check for bold element
    const bold = editor.locator('strong, b').first();
    await expect(bold).toBeVisible();
    expect(await bold.textContent()).toContain('Bold text');
  });

  test('should handle italic text formatting', async ({ page }) => {
    const editor = page.locator('.tiptap');
    await editor.click();
    await page.keyboard.type('Italic text');

    // Select all text
    await page.keyboard.press('Control+A');

    // Apply italic formatting (Ctrl+I)
    await page.keyboard.press('Control+I');

    await page.waitForTimeout(500);

    // Check for italic element
    const italic = editor.locator('em, i').first();
    await expect(italic).toBeVisible();
  });

  test('should create bullet lists', async ({ page }) => {
    const editor = page.locator('.tiptap');
    await editor.click();

    await page.keyboard.type('- First item');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Second item');

    await page.waitForTimeout(500);

    // Check for list elements
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

    // Check for ordered list
    const list = editor.locator('ol');
    await expect(list).toBeVisible();
  });

  test('should handle code blocks', async ({ page }) => {
    const editor = page.locator('.tiptap');
    await editor.click();

    // Type code block markdown
    await page.keyboard.type('```javascript');
    await page.keyboard.press('Enter');
    await page.keyboard.type('const hello = "world";');
    await page.keyboard.press('Enter');
    await page.keyboard.type('```');

    await page.waitForTimeout(500);

    // Check for code block
    const codeBlock = editor.locator('pre, code').first();
    await expect(codeBlock).toBeVisible();
  });

  test('should clear content when clear button is clicked', async ({ page }) => {
    const editor = page.locator('.tiptap');
    await editor.click();
    await editor.fill('Content to clear');

    // Find and click clear button
    const clearButton = page
      .getByRole('button', { name: /clear/i })
      .or(page.locator('button:has-text("Clear")'));

    if (await clearButton.isVisible()) {
      await clearButton.click();

      // Confirm clear if dialog appears
      const confirmButton = page.getByRole('button', { name: /confirm|yes|ok/i });
      if (await confirmButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await confirmButton.click();
      }

      // Editor should be empty
      const content = await editor.textContent();
      expect(content?.trim()).toBe('');
    }
  });

  test('should maintain formatting across multiple edits', async ({ page }) => {
    const editor = page.locator('.tiptap');
    await editor.click();

    // Add multiple formatted elements
    await page.keyboard.type('Regular text ');
    await page.keyboard.press('Control+B');
    await page.keyboard.type('bold');
    await page.keyboard.press('Control+B');
    await page.keyboard.type(' and ');
    await page.keyboard.press('Control+I');
    await page.keyboard.type('italic');

    await page.waitForTimeout(500);

    // Check all elements exist
    await expect(editor.locator('strong, b')).toBeVisible();
    await expect(editor.locator('em, i')).toBeVisible();
  });
});
