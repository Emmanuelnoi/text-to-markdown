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

  test('should convert rich text to markdown', async ({ page, browserName }, testInfo) => {
    const isMobile = testInfo.project.name.includes('Mobile');
    const waitTime = browserName === 'webkit' || isMobile ? 1500 : 500;

    // Type some text in the rich text editor (use keyboard.type for contenteditable)
    const editor = page.locator('.tiptap');
    await editor.click();
    await page.waitForTimeout(isMobile ? 500 : 300);

    // Use keyboard.type instead of fill() for contenteditable elements
    await page.keyboard.type('This is a test paragraph.');

    // Wait for content to be entered
    await page.waitForTimeout(waitTime);

    // Click the Convert button to trigger conversion and open preview
    // Use exact match to avoid matching "Markdown Preview Convert" accordion toggle
    const convertButton = page.getByRole('button', { name: 'Convert', exact: true });
    await expect(convertButton).toBeVisible({ timeout: 5000 });
    await convertButton.click();

    // Wait for conversion to complete and preview to open
    await page.waitForTimeout(waitTime);

    // Check that markdown preview is updated - the preview should now be visible
    const preview = page.locator('[data-testid="markdown-preview"]');
    await expect(preview).toBeVisible({ timeout: 10000 });

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

  test('should handle bold text formatting', async ({ page, browserName }, testInfo) => {
    // Skip on mobile devices - keyboard shortcuts don't work the same way
    const projectName = testInfo?.project?.name || '';
    if (projectName.includes('Mobile') || projectName.includes('mobile')) {
      test.skip();
      return;
    }

    const editor = page.locator('.tiptap');
    await editor.click();
    await page.keyboard.type('Bold text');

    // Use Meta for WebKit, Control for others
    const modifier = browserName === 'webkit' ? 'Meta' : 'Control';

    // Select all text
    await page.keyboard.press(`${modifier}+A`);

    // Apply bold formatting
    await page.keyboard.press(`${modifier}+B`);

    await page.waitForTimeout(500);

    // Check for bold element
    const bold = editor.locator('strong, b').first();
    await expect(bold).toBeVisible({ timeout: 5000 });
    expect(await bold.textContent()).toContain('Bold text');
  });

  test('should handle italic text formatting', async ({ page, browserName }, testInfo) => {
    // Skip on mobile devices - keyboard shortcuts don't work the same way
    const projectName = testInfo?.project?.name || '';
    if (projectName.includes('Mobile') || projectName.includes('mobile')) {
      test.skip();
      return;
    }

    const editor = page.locator('.tiptap');
    await editor.click();
    await page.keyboard.type('Italic text');

    // Use Meta for WebKit, Control for others
    const modifier = browserName === 'webkit' ? 'Meta' : 'Control';

    // Select all text
    await page.keyboard.press(`${modifier}+A`);

    // Apply italic formatting
    await page.keyboard.press(`${modifier}+I`);

    await page.waitForTimeout(500);

    // Check for italic element
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
    await page.keyboard.type('Content to clear');

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

  test('should maintain formatting across multiple edits', async ({
    page,
    browserName,
  }, testInfo) => {
    // Skip on mobile devices - keyboard shortcuts don't work the same way
    const projectName = testInfo?.project?.name || '';
    if (projectName.includes('Mobile') || projectName.includes('mobile')) {
      test.skip();
      return;
    }

    const editor = page.locator('.tiptap');
    await editor.click();

    // Use Meta for WebKit, Control for others
    const modifier = browserName === 'webkit' ? 'Meta' : 'Control';

    // Add multiple formatted elements
    await page.keyboard.type('Regular text ');
    await page.keyboard.press(`${modifier}+B`);
    await page.keyboard.type('bold');
    await page.keyboard.press(`${modifier}+B`);
    await page.keyboard.type(' and ');
    await page.keyboard.press(`${modifier}+I`);
    await page.keyboard.type('italic');

    await page.waitForTimeout(500);

    // Check all elements exist
    await expect(editor.locator('strong, b')).toBeVisible({ timeout: 5000 });
    await expect(editor.locator('em, i')).toBeVisible({ timeout: 5000 });
  });
});
