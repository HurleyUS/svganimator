# FALLOW REVIEW

## HEALTH

## Health Score: 97 (A)

## Vital Signs

| Metric | Value |
|:-------|------:|
| Total LOC | 3740 |
| Avg Cyclomatic | 1.6 |
| P90 Cyclomatic | 4 |
| Dead Files | 0.0% |
| Dead Exports | 0.0% |
| Maintainability (avg) | 95.5 |
| Hotspots | 0 |
| Circular Deps | 0 |
| Unused Deps | 0 |


### Coverage Gaps

*0 untested files · 0 untested exports · 100.0% file coverage*

_No coverage gaps found in scope._

### File Health Scores (17 files)

| File | Maintainability | Fan-in | Fan-out | Dead Code | Density | Risk |
|:-----|:---------------|:-------|:--------|:----------|:--------|:-----|
| `web/src/routes/index.tsx` | 86.0 | 0 | 7 | 0% | 0.19 | 13.8 |
| `shared/state/src/index.ts` | 90.6 | 1 | 1 | 0% | 0.22 | 4.9 |
| `web/src/components/providers.tsx` | 92.7 | 1 | 3 | 0% | 0.09 | 2.9 |
| `desktop/src/main.ts` | 92.9 | 0 | 1 | 0% | 0.15 | 2.9 |
| `web/src/lib/export-renderer.ts` | 93.6 | 1 | 1 | 0% | 0.12 | 2.9 |
| `web/src/routes/__root.tsx` | 93.8 | 0 | 2 | 0% | 0.07 | 1.2 |
| `mobile/app/index.tsx` | 95.1 | 0 | 2 | 0% | 0.03 | 1.2 |
| `shared/svg/src/index.ts` | 95.5 | 4 | 0 | 0% | 0.15 | 26.5 |
| `web/src/lib/posthog.ts` | 96.4 | 1 | 0 | 0% | 0.40 | 4.9 |
| `shared/ui/src/index.tsx` | 96.6 | 1 | 1 | 0% | 0.05 | 1.2 |
| `web/src/lib/stripe.ts` | 97.6 | 1 | 0 | 0% | 0.14 | 4.9 |
| `web/src/lib/resend.ts` | 98.1 | 1 | 0 | 0% | 0.13 | 2.9 |
| `web/src/lib/sentry.ts` | 98.2 | 1 | 0 | 0% | 0.18 | 2.9 |
| `shared/env/src/index.ts` | 98.7 | 0 | 0 | 0% | 0.05 | 1.2 |
| `mobile/app/_layout.tsx` | 99.4 | 0 | 0 | 0% | 0.13 | 1.2 |
| `shared/utils/src/index.ts` | 99.4 | 1 | 0 | 0% | 0.17 | 1.2 |
| `web/src/router.tsx` | 99.4 | 0 | 0 | 0% | 0.06 | 1.2 |

**Average maintainability index:** 95.5/100

---

<details><summary>Metric definitions</summary>

- **MI** — Maintainability Index (0–100, higher is better)
- **Fan-in** — files that import this file (blast radius)
- **Fan-out** — files this file imports (coupling)
- **Dead Code** — % of value exports with zero references
- **Density** — cyclomatic complexity / lines of code
- **File coverage** — runtime files also reachable from a discovered test root
- **Untested export** — export with no reference chain from any test-reachable module

[Full metric reference](https://docs.fallow.tools/explanations/metrics)

</details>



## AUDIT

   0.371582416s  WARN node_modules directory not found. Run `npm install` / `pnpm install` first for accurate results.
   0.400863833s  WARN node_modules directory not found. Run `npm install` / `pnpm install` first for accurate results.

Audit scope: 182 changed files vs main (3e38809..HEAD)
✓ No issues in 182 changed files (0.43s)


## DEAD

## Fallow: no issues found



## DUPLICATION

## Fallow: no code duplication found



## DOCSTRINGS

✔︎ 100% docstring coverage

