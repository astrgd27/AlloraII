/**
 * Loads the built Allora I game in headless Chromium and reads its data tables.
 * The tables are top-level constants of the page's script, so they are read by
 * name once the page has loaded. Nothing outside the file is fetched.
 */
import { pathToFileURL } from 'node:url';

/** Marks a value that is code, not data. It is dropped and counted in the report. */
export const FN_MARK = '__allora1_code__';
/** Marks a number that is not finite (NaN or Infinity). */
export const NONFINITE_MARK = '__allora1_nonfinite__';

export interface CollectedTable {
  /** The table as plain JSON, with code and non-finite numbers marked. */
  value?: unknown;
  /** Why the table could not be read. */
  error?: string;
}

/**
 * Runs inside the page. Written as a string so the bundler cannot add helpers
 * that do not exist in the page.
 */
const COLLECT_IN_PAGE = `(names) => {
  const FN = ${JSON.stringify(FN_MARK)};
  const NF = ${JSON.stringify(NONFINITE_MARK)};
  const out = {};
  for (const name of names) {
    try {
      const v = (0, eval)(name);
      const json = JSON.stringify(v, (k, x) => {
        if (typeof x === 'function') return FN;
        if (typeof x === 'number' && !Number.isFinite(x)) return NF;
        if (x instanceof Set) return [...x];
        if (x instanceof Map) return Object.fromEntries(x);
        return x;
      });
      out[name] = { value: json === undefined ? null : JSON.parse(json) };
    } catch (e) {
      out[name] = { error: String(e && e.message ? e.message : e) };
    }
  }
  return out;
}`;

export async function collectTables(
  htmlPath: string,
  tables: string[],
): Promise<Record<string, CollectedTable>> {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.route(/^https?:/, (route) => route.abort());
    const pageErrors: string[] = [];
    page.on('pageerror', (e) => pageErrors.push(e.message));
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'load' });
    const result = (await page.evaluate(
      `(${COLLECT_IN_PAGE})(${JSON.stringify(tables)})`,
    )) as Record<string, CollectedTable>;
    if (pageErrors.length > 0) {
      result.__page_errors__ = { error: pageErrors.join('\n') };
    }
    return result;
  } finally {
    await browser.close();
  }
}
