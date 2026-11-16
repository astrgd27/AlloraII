# Content batches

Small scripts that turn a compact table of places into YAML (places, people, activities, roads).
Run one from the repository root: `python3 tools/batches/marre01.py tools/batches`.
Then `pnpm world`, `pnpm world:plan`, `pnpm lint:content` and `pnpm format`.
A batch is written once. After its YAML has been edited by hand, do not run it again.
