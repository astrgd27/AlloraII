# First session

Open Claude Code in the repository root and paste this:

---

Read CLAUDE.md, then docs/design-bible.md (Principles, Technical foundation, Content pipeline and Building it with Claude Code), then docs/phase-0.md.

Turn every Phase 0 item into a GitHub issue with a clear done-check, labelled `phase-0`. Then start on issue 1.

Work one issue at a time: a branch, the work, tests, and a pull request saying what changed and what you could not decide. Never edit canon/. When canon is silent, add to it with roots; when you are unsure whether something contradicts canon, stop and ask.

---

## Later sessions

Paste:

> Read CLAUDE.md and docs/phase-0.md (or the current phase file). Pick the next open issue, and carry on.

## Before the first session

1. Create the GitHub repository and push this starter kit to `main`.
2. Add `canon/magic_design.md` (your magic design notes) if you have it.
3. Install the Claude GitHub app on the repository so pull requests get reviewed (`/install-github-app` in Claude Code).
4. In the repository settings, turn on GitHub Pages from GitHub Actions.
5. Make sure the `gh` command line tool is signed in, so Claude Code can open issues and pull requests.
