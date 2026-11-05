import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const QUIZ: { q: string; o: string[]; a: number }[] = JSON.parse(readFileSync('content/midterm/quiz.json', 'utf8'));

async function answer(page: Page, correct: boolean) {
  const text = await page.locator('.q-text').textContent();
  const q = QUIZ.find(x => x.q === text);
  if (!q) throw new Error(`question not found: ${text}`);
  const right = page.locator('.opt').filter({ hasText: q.o[q.a] }).first();
  if (correct) await right.click();
  else await page.locator('.opt').filter({ hasNotText: q.o[q.a] }).first().click();
}

const axe = async (page: Page) =>
  (await new AxeBuilder({ page }).analyze()).violations.map(v => `${v.id}: ${v.nodes.map(n => n.target).join(' | ')}`);
const noOverflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

for (const variant of ['arena', 'combo', 'journal']) {
  test(`${variant}: streak hits the monster, Enter advances, 8/10 beats it`, async ({ page }, info) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    const shot = (name: string) => page.screenshot({ path: `screenshots/tmp/${variant}-${name}-${info.project.name}.png`, fullPage: true });

    await page.goto(`/#${variant}`);
    await expect(page.getByText(/Chưa làm/).first()).toBeVisible();
    expect(await axe(page)).toEqual([]);
    await shot('home');

    await page.getByRole('button', { name: /Làm 10 câu/ }).nth(1).click();
    await expect(page.getByText('Câu 1/10')).toBeVisible();
    await expect(page.getByText('HP 90/90')).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(page.getByText('Câu 1/10')).toBeVisible();
    expect(await axe(page)).toEqual([]);
    await shot('start');

    // Five right in a row: 10, 10, 15, 15, 20.
    const hp = [80, 70, 55, 40, 20];
    for (let k = 0; k < 5; k++) {
      await answer(page, true);
      await expect(page.getByText(`HP ${hp[k]}/90`)).toBeVisible();
      await expect(page.getByText(/✔ ĐÚNG/)).toBeVisible();
      if (k === 4) {
        await page.waitForTimeout(150);
        await shot('shot');
        await page.waitForTimeout(1200);
        expect(await axe(page)).toEqual([]);
        expect(await noOverflow(page)).toBe(true);
        await shot('streak');
      }
      await page.keyboard.press('Enter');
    }

    // A miss resets the streak but the monster keeps its damage.
    await answer(page, false);
    await expect(page.getByText('HP 20/90')).toBeVisible();
    await page.waitForTimeout(400);
    expect(await axe(page)).toEqual([]);
    await shot('miss');
    await page.mouse.click(2, 300);
    await page.keyboard.press('Enter');

    await answer(page, true);
    await expect(page.getByText('HP 10/90')).toBeVisible();
    await page.keyboard.press('Enter');
    await answer(page, true);
    await expect(page.getByText('HP 1/90')).toBeVisible();
    await page.keyboard.press('Enter');
    await answer(page, true);
    await expect(page.getByText('HP 0/90')).toBeVisible();
    await page.keyboard.press('Enter');
    await answer(page, false);
    await page.keyboard.press('Enter');

    await expect(page.getByText(/Đã hạ .+!/)).toBeVisible();
    await expect(page.getByText('Đúng 8/10 câu')).toBeVisible();
    await expect(page.getByText('Qua màn!')).toBeVisible();
    await page.waitForTimeout(600);
    expect(await axe(page)).toEqual([]);
    expect(await noOverflow(page)).toBe(true);
    await shot('result');
    await page.getByRole('button', { name: 'Về danh sách World' }).click();
    await expect(page.getByText(/Chưa làm 35\/45/)).toBeVisible();
    expect(errors).toEqual([]);
  });

  test(`${variant}: reduced motion still shows damage and a keyboard user keeps the back button`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/#${variant}`);
    await page.getByRole('button', { name: /Làm 10 câu/ }).first().click();
    await answer(page, true);
    await expect(page.getByText('HP 80/90')).toBeVisible();
    await expect(page.locator('.shot')).toHaveCount(0);
    await page.getByRole('button', { name: /Về danh sách World/ }).focus();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Enter');
    await expect(page.locator('.opt')).toHaveCount(0);
  });
}
