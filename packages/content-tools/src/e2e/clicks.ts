/**
 * `pnpm e2e`: plays the built game in a real browser and checks that every
 * click answers. Each enabled button, when clicked, must change what is on
 * screen or show a refusal; each disabled button must say why on hover.
 * Run `pnpm build` first.
 */
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Page } from 'playwright';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const DIST = join(ROOT, 'packages/ui/dist');
const BASE = '/AlloraII/';
const TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
};

function serve(): Promise<{ url: string; close: () => void }> {
  const server = createServer((req, res) => {
    const path = (req.url ?? '/').split('?')[0] ?? '/';
    let file = join(DIST, path.startsWith(BASE) ? path.slice(BASE.length) : path);
    if (!existsSync(file) || statSync(file).isDirectory()) file = join(DIST, 'index.html');
    res.setHeader('Content-Type', TYPES[extname(file)] ?? 'application/octet-stream');
    createReadStream(file).pipe(res);
  });
  return new Promise((ok) =>
    server.listen(0, () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      ok({ url: `http://localhost:${port}${BASE}`, close: () => server.close() });
    }),
  );
}

/** What the player can see: the text, and which buttons are pressed or disabled. */
const look = (page: Page): Promise<string> =>
  page.evaluate(`(() => {
    const main = document.querySelector('main');
    const states = [...document.querySelectorAll('button')]
      .map((b) => (b.getAttribute('aria-pressed') ?? '') + (b.disabled ? 'd' : ''))
      .join('');
    return (main ? main.innerText : '') + '|' + states;
  })()`);

async function main(): Promise<void> {
  if (!existsSync(join(DIST, 'index.html'))) throw new Error('Run `pnpm build` first.');
  const { chromium } = await import('playwright');
  const site = await serve();
  const browser = await chromium.launch();
  const problems: string[] = [];
  let clicks = 0;
  try {
    for (const seed of [1, 2, 3]) {
      const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
      page.on('pageerror', (e) => problems.push(`page error: ${e.message}`));
      await page.goto(`${site.url}?rate=4000`);
      await page.waitForSelector('[data-testid=now]', { timeout: 15000 });
      await page.waitForTimeout(500);

      // Every disabled button says why.
      const silent = (await page.evaluate(`[...document.querySelectorAll('main button:disabled')]
        .filter((b) => b.checkVisibility() && !(b.title || '').trim())
        .map((b) => b.innerText.split('\\n')[0])`)) as string[];
      for (const text of silent) problems.push(`disabled with no reason: "${text}"`);

      // Click enabled buttons, one after another, and watch for an answer.
      for (let i = 0; i < 25; i++) {
        // Mark the enabled, visible buttons in the page itself: one round trip, not hundreds.
        const count = (await page.evaluate(`(() => {
          let n = 0;
          for (const b of document.querySelectorAll('main button:not(.map-tools button)')) {
            b.removeAttribute('data-e2e');
            const hidden = !b.checkVisibility({ contentVisibilityAuto: true, visibilityProperty: true });
            if (b.disabled || b.getAttribute('aria-pressed') === 'true' || hidden) continue;
            b.setAttribute('data-e2e', String(n++));
          }
          return n;
        })()`)) as number;
        if (count === 0) break;
        const button = page.locator(`[data-e2e="${(i * 7 + seed * 3) % count}"]`);
        const label =
          (await button.innerText({ timeout: 1000 }).catch(() => '')).split('\n')[0] ?? '';
        const before = await look(page);
        // The page may change under the pointer (a list re-sorts); that is not a fault.
        if (
          !(await button.click({ timeout: 1500 }).then(
            () => true,
            () => false,
          ))
        )
          continue;
        clicks += 1;
        await page.waitForTimeout(250);
        const after = await look(page);
        const refused = await page.locator('[data-testid=refusal]').count();
        if (after === before && refused === 0) problems.push(`no answer to "${label}"`);
        // The codex covers the game: close it before the next click.
        if ((await page.locator('[data-testid=codex]').count()) > 0)
          await page.keyboard.press('Escape');
      }
      // The codex opens, turns its tabs, and closes again.
      await page.locator('[data-testid=codex-open]').click();
      const entry = () => page.locator('.codex-entry h3').innerText({ timeout: 1000 });
      const firstEntry = await entry().catch(() => '');
      if (!firstEntry) problems.push('the codex opens on nothing');
      await page.locator('[data-codex-tab=regions]').click();
      if ((await entry().catch(() => firstEntry)) === firstEntry)
        problems.push('the codex tabs do not turn');
      await page.keyboard.press('Escape');
      if ((await page.locator('[data-testid=codex]').count()) > 0)
        problems.push('the codex does not close');
      // The map's own tools move the view.
      const view = () => page.locator('[data-testid=map]').getAttribute('data-view');
      const start = await view();
      await page.locator('.map-tools button').nth(0).click();
      await page.waitForTimeout(150);
      if ((await view()) === start) problems.push('the map does not zoom in');
      await page.locator('.map-tools button').nth(3).click();
      await page.waitForTimeout(150);
      await page.locator('.map-tools button').nth(2).click();
      await page.waitForTimeout(150);
      if ((await view()) !== '1.00,0,0')
        problems.push('the map does not return to the whole realm');
      await page.mouse.move(640, 400);
      await page.mouse.wheel(0, -300);
      await page.waitForTimeout(150);
      if ((await view()) === '1.00,0,0') problems.push('the wheel does not zoom');
      await page.close();
    }
  } finally {
    await browser.close();
    site.close();
  }
  if (problems.length > 0) {
    console.error(`${problems.length} problems in ${clicks} clicks:\n- ${problems.join('\n- ')}`);
    process.exit(1);
  }
  console.log(`Every click answered (${clicks} clicks over 3 games).`);
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});
