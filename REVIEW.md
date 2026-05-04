# FALLOW REVIEW

## HEALTH

## Health Score: 98 (A)

## Vital Signs

| Metric | Value |
|:-------|------:|
| Total LOC | 3949 |
| Avg Cyclomatic | 1.8 |
| P90 Cyclomatic | 4 |
| Dead Files | 0.0% |
| Dead Exports | 0.0% |
| Maintainability (avg) | 90.3 |
| Hotspots | 0 |
| Circular Deps | 0 |
| Unused Deps | 0 |


### Coverage Gaps

*0 untested files · 0 untested exports · 100.0% file coverage*

_No coverage gaps found in scope._

### File Health Scores (31 files)

| File | Maintainability | Fan-in | Fan-out | Dead Code | Density | Risk |
|:-----|:---------------|:-------|:--------|:----------|:--------|:-----|
| `src/renderer/src/test/setup.ts` | 81.3 | 5 | 0 | 0% | 0.82 | 1.2 |
| `src/renderer/src/store/useStore.ts` | 86.4 | 19 | 3 | 0% | 0.27 | 13.8 |
| `src/renderer/src/components/AnimateMenu.tsx` | 86.7 | 2 | 3 | 0% | 0.26 | 4.9 |
| `src/renderer/src/utils/geometry.ts` | 86.7 | 3 | 1 | 0% | 0.35 | 11.4 |
| `src/renderer/src/components/PropertiesPanel.tsx` | 87.0 | 2 | 4 | 0% | 0.22 | 17.6 |
| `src/renderer/src/utils/interpolator.ts` | 87.0 | 2 | 1 | 0% | 0.34 | 17.6 |
| `src/renderer/src/App.tsx` | 87.2 | 2 | 9 | 0% | 0.12 | 4.9 |
| `src/renderer/src/components/components.test.tsx` | 88.4 | 0 | 9 | 0% | 0.08 | 1.2 |
| `src/renderer/src/components/Timeline.tsx` | 88.5 | 2 | 4 | 0% | 0.17 | 10.4 |
| `src/renderer/src/components/TransformOverlay.tsx` | 88.8 | 2 | 3 | 0% | 0.19 | 17.6 |
| `src/renderer/src/components/ContextMenu.tsx` | 89.1 | 2 | 3 | 0% | 0.18 | 4.9 |
| `src/renderer/src/utils/geometry.test.ts` | 89.1 | 0 | 4 | 0% | 0.15 | 2.9 |
| `src/renderer/src/components/Canvas.tsx` | 89.4 | 2 | 4 | 0% | 0.14 | 7.5 |
| `src/renderer/src/utils/pathOps.ts` | 89.5 | 2 | 0 | 0% | 0.35 | 19.1 |
| `src/renderer/src/components/Sidebar.tsx` | 89.9 | 2 | 2 | 0% | 0.19 | 21.8 |
| `src/renderer/src/components/Toolbar.tsx` | 90.0 | 2 | 3 | 0% | 0.15 | 21.8 |
| `src/main/index.test.ts` | 90.3 | 0 | 1 | 0% | 0.23 | 4.9 |
| `src/preload/index.test.ts` | 90.8 | 0 | 2 | 0% | 0.23 | 1.2 |
| `src/renderer/src/utils/exporter.ts` | 90.9 | 2 | 1 | 0% | 0.21 | 4.9 |
| `src/renderer/src/utils/svgParser.ts` | 91.2 | 2 | 1 | 0% | 0.20 | 21.8 |
| `src/renderer/src/main.test.tsx` | 91.4 | 0 | 2 | 0% | 0.28 | 2.9 |
| `src/renderer/src/components/useAnimationTarget.ts` | 92.6 | 2 | 3 | 0% | 0.19 | 3.0 |
| `src/renderer/src/utils/animationProperties.ts` | 93.0 | 6 | 1 | 0% | 0.14 | 4.1 |
| `src/renderer/src/utils/svgTree.ts` | 93.1 | 6 | 1 | 0% | 0.24 | 4.1 |
| `src/renderer/src/utils/svgParser.test.ts` | 93.3 | 0 | 2 | 0% | 0.14 | 1.2 |
| `src/renderer/src/utils/interpolator.test.ts` | 93.8 | 0 | 2 | 0% | 0.06 | 1.2 |
| `src/renderer/src/utils/pathOps.test.ts` | 93.8 | 0 | 2 | 0% | 0.17 | 1.2 |
| `src/main/index.ts` | 94.0 | 1 | 0 | 0% | 0.20 | 4.1 |
| `src/renderer/src/utils/exporter.test.ts` | 94.4 | 0 | 2 | 0% | 0.07 | 1.2 |
| `src/renderer/src/main.tsx` | 95.0 | 2 | 2 | 0% | 0.06 | 1.0 |
| `src/preload/index.ts` | 97.0 | 1 | 0 | 0% | 0.13 | 2.9 |

**Average maintainability index:** 90.3/100

### Refactoring Targets (2)

| Efficiency | Category | Effort / Confidence | File | Recommendation |
|:-----------|:---------|:--------------------|:-----|:---------------|
| 12.4 | high impact | high / medium | `src/renderer/src/test/setup.ts` | Split high-impact file (38 LOC) — 5 dependents amplify every change |
| 9.6 | high impact | medium / medium | `src/renderer/src/utils/geometry.ts` | Split high-impact file (72 LOC) — 3 dependents amplify every change |

---

<details><summary>Metric definitions</summary>

- **MI** — Maintainability Index (0–100, higher is better)
- **Fan-in** — files that import this file (blast radius)
- **Fan-out** — files this file imports (coupling)
- **Dead Code** — % of value exports with zero references
- **Density** — cyclomatic complexity / lines of code
- **File coverage** — runtime files also reachable from a discovered test root
- **Untested export** — export with no reference chain from any test-reachable module
- **Efficiency** — priority / effort (higher = better quick-win value, default sort)
- **Category** — recommendation type (churn+complexity, high impact, dead code, complexity, coupling, circular dep)
- **Effort** — estimated effort (low / medium / high) based on file size, function count, and fan-in
- **Confidence** — recommendation reliability (high = deterministic analysis, medium = heuristic, low = git-dependent)

[Full metric reference](https://docs.fallow.tools/explanations/metrics)

</details>



## AUDIT

   0.315058416s  WARN node_modules directory not found. Run `npm install` / `pnpm install` first for accurate results.
   1.058061041s  WARN node_modules directory not found. Run `npm install` / `pnpm install` first for accurate results.

Audit scope: 49 changed files vs main (0965ad7..HEAD)
✓ No issues in 49 changed files (1.10s)


## DEAD

## Fallow: no issues found



## DUPLICATION

## Fallow: no code duplication found



## DOCSTRINGS

✔︎ 100% docstring coverage

