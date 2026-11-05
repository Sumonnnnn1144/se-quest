import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('quiz flow: answer, Enter to advance, results, no a11y or console errors', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto('/');
  await expect(page.getByText(/Chưa làm/).first()).toBeVisible();
  await page.screenshot({ path: `screenshots/tmp/home-${info.project.name}.png`, fullPage: true });
  expect((await new AxeBuilder({ page }).analyze()).violations.map(v => `${v.id}: ${v.nodes.map(n => n.target).join(' | ')}`)).toEqual([]);

  await page.getByRole('button', { name: /Làm 10 câu/ }).nth(1).click();
  await page.locator('.opt').first().waitFor();
  await page.keyboard.press('Enter');
  await expect(page.getByText('Câu 1/10')).toBeVisible();

  await page.locator('.opt').nth(1).click();
  await expect(page.getByText(/Nguồn slide/)).toBeVisible();
  await expect(page.getByText(/✔ ĐÚNG/)).toBeVisible();
  await page.waitForTimeout(350);
  await page.screenshot({ path: `screenshots/tmp/quiz-${info.project.name}.png`, fullPage: true });
  expect((await new AxeBuilder({ page }).analyze()).violations.map(v => `${v.id}: ${v.nodes.map(n => n.target).join(' | ')}`)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);

  await page.mouse.click(2, 300);
  await page.keyboard.press('Enter');
  await expect(page.getByText('Câu 2/10')).toBeVisible();
  for (let i = 2; i <= 10; i++) {
    await page.locator('.opt').first().click();
    await page.keyboard.press('Enter');
  }
  await expect(page.getByText(/Đúng \d+\/10 câu/)).toBeVisible();

  await page.getByRole('button', { name: 'Về danh sách World' }).click();
  await expect(page.getByText(/Chưa làm \d+\/\d+ câu/).nth(1)).toBeVisible();
  expect(errors).toEqual([]);
});

test('keyboard user on the back button keeps its Enter', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Làm 10 câu/ }).first().click();
  await page.locator('.opt').first().click();
  await page.getByRole('button', { name: /Về danh sách World/ }).focus();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Enter');
  await expect(page.locator('.opt')).toHaveCount(0);
});
