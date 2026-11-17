import {chromium} from '@playwright/test';
import fs from 'node:fs';
const out = 'shots';
fs.mkdirSync(out, {recursive: true});
const browser = await chromium.launch();
const page = await browser.newPage({viewport: {width: 1040, height: 420}});
page.on('console', (m) => console.log('console:', m.text()));
page.on('pageerror', (e) => console.log('pageerror:', e.message));
const base = 'http://localhost:5199/';
const shot = async (name) => { await page.screenshot({path: `${out}/${name}.png`, fullPage: true}); };
const cell = (r, c) => page.locator(`tr[data-row-index="${r}"] td[data-col-index="${c}"]`);

await page.goto(`${base}?scene=join&mode=before`); await page.waitForSelector('td[data-col-index]'); await shot('1-before-join-read-only');
await page.goto(`${base}?scene=join&mode=after`); await page.waitForSelector('th button[data-column-edit]'); await page.waitForTimeout(500); await shot('2-after-join-column-icons');
// keyboard focus on the first lock icon
await page.locator('th button[data-column-edit]').first().focus(); await shot('3-after-keyboard-focus-on-lock');
// edit the customer's name on row 0: shows on both rows of customer 3 (1:N)
await cell(0, 3).dblclick(); await page.locator('textarea').fill('Grace'); await page.keyboard.press('Enter'); await page.waitForTimeout(300);
await shot('4-after-edit-shows-on-every-copy-1n');
// edit an order total, other table
await cell(1, 1).dblclick(); await page.locator('textarea').fill('15'); await page.keyboard.press('Enter'); await page.waitForTimeout(300);
await shot('5-after-edits-in-two-tables');
// self join: everything read-only
await page.goto(`${base}?scene=selfjoin&mode=after`); await page.waitForSelector('th button[data-column-edit]'); await page.waitForTimeout(500); await shot('6-self-join-ambiguous-read-only');
await browser.close();
