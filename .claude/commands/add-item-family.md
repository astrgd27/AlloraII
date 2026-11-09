---
description: Add a family of craftable items across tiers
argument-hint: <family, e.g. "glass vessels">
---
Add an item family: $ARGUMENTS

1. Check canon items and recipes (`/canon`) and reuse canon names and materials where they exist.
2. Follow the tier table, quality grades and value formula in `docs/design-bible.md` (Crafting and the item database). Compute values; do not type them by hand.
3. Each entry: id, tier, materials, hours, skill and level, value, uses (at least one), and where it is made or sold.
4. Run `pnpm lint:content` (every item made and used). Summarise.
