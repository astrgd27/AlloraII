/** Adds the schema check to an extraction's report. */
import { parse } from 'yaml';
import { renderSchemaCheck, validateFile, type FileCheck } from '../schemas/validate';

export function checkFiles(files: Map<string, string>): FileCheck[] {
  return [...files]
    .filter(([name]) => name.endsWith('.yaml'))
    .map(([name, text]) => validateFile(name, parse(text) as unknown[]));
}

/** Returns the files with a "Schema check" section appended to REPORT.md. */
export function withSchemaCheck(files: Map<string, string>): Map<string, string> {
  const out = new Map(files);
  const report = out.get('REPORT.md');
  if (report !== undefined) {
    out.set('REPORT.md', `${report.trimEnd()}\n\n${renderSchemaCheck(checkFiles(files))}`);
  }
  return out;
}
