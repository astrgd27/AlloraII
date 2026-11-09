---
description: Add a new place that grows from canon
argument-hint: <what and where, e.g. "a dockside tavern in Marre">
---
Add a new place: $ARGUMENTS

1. Run the `/canon` lookup on the land, realm, town and anything nearby. Read the culture guide for that land in `docs/lore/cultures/`.
2. Check the place does not already exist in canon or in `content/`.
3. Write the YAML with `origin: allora2`, `roots` (its realm, town and any canon group or person it serves), kind, level band, who lives and works there and why, sub-places, links and travel times, and a short art brief.
4. Name it in the land's naming style. No near-copies of canon names.
5. Run `pnpm lint:content` and fix anything it flags.
6. Summarise what you added and which canon it grows from.
