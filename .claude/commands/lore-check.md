---
description: Check a change against canon, the culture guides and the world rules
argument-hint: <branch, PR number or files; empty = current changes>
---
Check for lore problems in: ${ARGUMENTS:-the current uncommitted changes and this branch}

For every new or changed entry and line of game text:
- Does it contradict anything in canon? Look it up; do not trust memory.
- Does every addition have valid `roots`?
- Do names follow the land's culture guide, without near-copying canon names?
- Does it break a world rule in CLAUDE.md?

List each problem with the file, the canon it conflicts with (quoted), and a suggested fix. If there are none, say so.
