# FALLOW REVIEW

## OBSERVABILITY

PASS: static Sentry/PostHog coverage checks (react-native)

## HEALTH

{
"$schema": "https://json.schemastore.org/sarif-2.1.0.json",
"version": "2.1.0",
"runs": [
{
"tool": {
"driver": {
"name": "fallow",
"version": "2.74.0",
"informationUri": "https://github.com/fallow-rs/fallow",
"rules": [
{
"id": "fallow/high-cyclomatic-complexity",
"shortDescription": {
"text": "Function has high cyclomatic complexity"
},
"fullDescription": {
"text": "McCabe cyclomatic complexity exceeds the configured threshold. Cyclomatic complexity counts the number of independent paths through a function (1 + decision points: if/else, switch cases, loops, ternary, logical operators). High values indicate functions that are hard to test exhaustively."
},
"helpUri": "https://docs.fallow.tools/explanations/health#cyclomatic-complexity",
"defaultConfiguration": {
"level": "note"
}
},
{
"id": "fallow/high-cognitive-complexity",
"shortDescription": {
"text": "Function has high cognitive complexity"
},
"fullDescription": {
"text": "SonarSource cognitive complexity exceeds the configured threshold. Unlike cyclomatic complexity, cognitive complexity penalizes nesting depth and non-linear control flow (breaks, continues, early returns). It measures how hard a function is to understand when reading sequentially."
},
"helpUri": "https://docs.fallow.tools/explanations/health#cognitive-complexity",
"defaultConfiguration": {
"level": "note"
}
},
{
"id": "fallow/high-complexity",
"shortDescription": {
"text": "Function exceeds both complexity thresholds"
},
"fullDescription": {
"text": "Function exceeds both cyclomatic and cognitive complexity thresholds. This is the strongest signal that a function needs refactoring, it has many paths AND is hard to understand."
},
"helpUri": "https://docs.fallow.tools/explanations/health#complexity-metrics",
"defaultConfiguration": {
"level": "note"
}
},
{
"id": "fallow/high-crap-score",
"shortDescription": {
"text": "Function has a high CRAP score (complexity combined with low coverage)"
},
"fullDescription": {
"text": "The function's CRAP (Change Risk Anti-Patterns) score meets or exceeds the configured threshold. CRAP combines cyclomatic complexity with test coverage using the Savoia and Evans (2007) formula: `CC^2 * (1 - coverage/100)^3 + CC`. High CRAP indicates changes to this function carry high risk because it is complex AND poorly tested. Pair with `--coverage` for accurate per-function scoring; without it fallow estimates coverage from the module graph."
},
"helpUri": "https://docs.fallow.tools/explanations/health#crap-score",
"defaultConfiguration": {
"level": "warning"
}
},
{
"id": "fallow/refactoring-target",
"shortDescription": {
"text": "File identified as a high-priority refactoring candidate"
},
"fullDescription": {
"text": "File identified as a refactoring candidate based on a weighted combination of complexity density, churn velocity, dead code ratio, fan-in (blast radius), and fan-out (coupling). Categories: urgent churn+complexity, break circular dependency, split high-impact file, remove dead code, extract complex functions, reduce coupling."
},
"helpUri": "https://docs.fallow.tools/explanations/health#refactoring-targets",
"defaultConfiguration": {
"level": "warning"
}
},
{
"id": "fallow/untested-file",
"shortDescription": {
"text": "Runtime-reachable file has no test dependency path"
},
"fullDescription": {
"text": "A file is reachable from runtime entry points but not from any discovered test entry point. This indicates production code that no test imports, directly or transitively, according to the static module graph."
},
"helpUri": "https://docs.fallow.tools/explanations/health#coverage-gaps",
"defaultConfiguration": {
"level": "warning"
}
},
{
"id": "fallow/untested-export",
"shortDescription": {
"text": "Runtime-reachable export has no test dependency path"
},
"fullDescription": {
"text": "A value export is reachable from runtime entry points but no test-reachable module references it. This is a static test dependency gap rather than line coverage, and highlights exports exercised only through production entry paths."
},
"helpUri": "https://docs.fallow.tools/explanations/health#coverage-gaps",
"defaultConfiguration": {
"level": "warning"
}
},
{
"id": "fallow/runtime-safe-to-delete",
"shortDescription": {
"text": "Statically unused AND never invoked in production with V8 tracking"
},
"fullDescription": {
"text": "The function is both statically unreachable in the module graph and was never invoked during the observed runtime coverage window. This is the highest-confidence delete signal fallow emits."
},
"helpUri": "https://docs.fallow.tools/explanations/health#runtime-coverage",
"defaultConfiguration": {
"level": "warning"
}
},
{
"id": "fallow/runtime-review-required",
"shortDescription": {
"text": "Statically used but never invoked in production"
},
"fullDescription": {
"text": "The function is reachable in the module graph (or exercised by tests / untracked call sites) but was not invoked during the observed runtime coverage window. Needs a human look: may be seasonal, error-path only, or legitimately unused."
},
"helpUri": "https://docs.fallow.tools/explanations/health#runtime-coverage",
"defaultConfiguration": {
"level": "warning"
}
},
{
"id": "fallow/runtime-low-traffic",
"shortDescription": {
"text": "Function was invoked below the low-traffic threshold"
},
"fullDescription": {
"text": "The function was invoked in production but below the configured `--low-traffic-threshold` fraction of total trace count (spec default 0.1%). Effectively dead for the current period."
},
"helpUri": "https://docs.fallow.tools/explanations/health#runtime-coverage",
"defaultConfiguration": {
"level": "note"
}
},
{
"id": "fallow/runtime-coverage-unavailable",
"shortDescription": {
"text": "Runtime coverage could not be resolved for this function"
},
"fullDescription": {
"text": "The function could not be matched to a V8-tracked coverage entry. Common causes: the function lives in a worker thread (separate V8 isolate), it is lazy-parsed and never reached the JIT tier, or its source map did not resolve to the expected source path. This is advisory, not a dead-code signal."
},
"helpUri": "https://docs.fallow.tools/explanations/health#runtime-coverage",
"defaultConfiguration": {
"level": "note"
}
},
{
"id": "fallow/runtime-coverage",
"shortDescription": {
"text": "Runtime coverage finding"
},
"fullDescription": {
"text": "Generic runtime-coverage finding for verdicts not covered by a more specific rule. Covers the forward-compat `unknown` sentinel; the CLI filters `active` entries out of `runtime_coverage.findings` so the surfaced list stays actionable."
},
"helpUri": "https://docs.fallow.tools/explanations/health#runtime-coverage",
"defaultConfiguration": {
"level": "note"
}
}
]
}
},
"results": []
}
]
}

## AUDIT

[2m 0.325688333s[0m [33m WARN[0m Broken tsconfig chain: Tsconfig not found expo/tsconfig.base. Falling back to resolver-less resolution for affected files. Relative and bare imports still work, but tsconfig path aliases from missing inherited configs will not. Fix the extends/references chain to restore full alias support.
{
"$schema": "https://json.schemastore.org/sarif-2.1.0.json",
  "version": "2.1.0",
  "runs": [
    {
      "tool": {
        "driver": {
          "name": "fallow",
          "version": "2.74.0",
          "informationUri": "https://github.com/fallow-rs/fallow",
          "rules": [
            {
              "id": "fallow/unused-file",
              "shortDescription": {
                "text": "File is not reachable from any entry point"
              },
              "fullDescription": {
                "text": "Source files that are not imported by any other module and are not entry points (scripts, tests, configs). These files can safely be deleted. Detection uses graph reachability from configured entry points."
              },
              "helpUri": "https://docs.fallow.tools/explanations/dead-code#unused-files",
              "defaultConfiguration": {
                "level": "error"
              }
            },
            {
              "id": "fallow/unused-export",
              "shortDescription": {
                "text": "Export is never imported"
              },
              "fullDescription": {
                "text": "Named exports that are never imported by any other module in the project. Includes both direct exports and re-exports through barrel files. The export may still be used locally within the same file."
              },
              "helpUri": "https://docs.fallow.tools/explanations/dead-code#unused-exports",
              "defaultConfiguration": {
                "level": "error"
              }
            },
            {
              "id": "fallow/unused-type",
              "shortDescription": {
                "text": "Type export is never imported"
              },
              "fullDescription": {
                "text": "Type-only exports (interfaces, type aliases, enums used only as types) that are never imported. These do not generate runtime code but add maintenance burden."
              },
              "helpUri": "https://docs.fallow.tools/explanations/dead-code#unused-types",
              "defaultConfiguration": {
                "level": "error"
              }
            },
            {
              "id": "fallow/private-type-leak",
              "shortDescription": {
                "text": "Exported signature references a private type"
              },
              "fullDescription": {
                "text": "Exported values or types whose public TypeScript signature references a same-file type declaration that is not exported. Consumers cannot name that private type directly, so the backing type should be exported or removed from the public signature."
              },
              "helpUri": "https://docs.fallow.tools/explanations/dead-code#private-type-leaks",
              "defaultConfiguration": {
                "level": "none"
              }
            },
            {
              "id": "fallow/unused-dependency",
              "shortDescription": {
                "text": "Dependency listed but never imported"
              },
              "fullDescription": {
                "text": "Packages listed in dependencies that are never imported or required by any source file. Framework plugins and CLI tools may be false positives; use the ignore_dependencies config to suppress."
              },
              "helpUri": "https://docs.fallow.tools/explanations/dead-code#unused-dependencies",
              "defaultConfiguration": {
                "level": "error"
              }
            },
            {
              "id": "fallow/unused-dev-dependency",
              "shortDescription": {
                "text": "Dev dependency listed but never imported"
              },
              "fullDescription": {
                "text": "Packages listed in devDependencies that are never imported by test files, config files, or scripts. Build tools and jest presets that are referenced only in config may appear as false positives."
              },
              "helpUri": "https://docs.fallow.tools/explanations/dead-code#unused-devdependencies",
              "defaultConfiguration": {
                "level": "warning"
              }
            },
            {
              "id": "fallow/unused-optional-dependency",
              "shortDescription": {
                "text": "Optional dependency listed but never imported"
              },
              "fullDescription": {
                "text": "Packages listed in optionalDependencies that are never imported. Optional dependencies are typically platform-specific; verify they are not needed on any supported platform before removing."
              },
              "helpUri": "https://docs.fallow.tools/explanations/dead-code#unused-optionaldependencies",
              "defaultConfiguration": {
                "level": "warning"
              }
            },
            {
              "id": "fallow/type-only-dependency",
              "shortDescription": {
                "text": "Production dependency only used via type-only imports"
              },
              "fullDescription": {
                "text": "Production dependencies that are only imported via `import type` statements. These can be moved to devDependencies since they generate no runtime code and are stripped during compilation."
              },
              "helpUri": "https://docs.fallow.tools/explanations/dead-code#type-only-dependencies",
              "defaultConfiguration": {
                "level": "warning"
              }
            },
            {
              "id": "fallow/test-only-dependency",
              "shortDescription": {
                "text": "Production dependency only imported by test files"
              },
              "fullDescription": {
                "text": "Production dependencies that are only imported from test files. These can usually move to devDependencies because production entry points do not require them at runtime."
              },
              "helpUri": "https://docs.fallow.tools/explanations/dead-code#test-only-dependencies",
              "defaultConfiguration": {
                "level": "warning"
              }
            },
            {
              "id": "fallow/unused-enum-member",
              "shortDescription": {
                "text": "Enum member is never referenced"
              },
              "fullDescription": {
                "text": "Enum members that are never referenced in the codebase. Uses scope-aware binding analysis to track all references including computed access patterns."
              },
              "helpUri": "https://docs.fallow.tools/explanations/dead-code#unused-enum-members",
              "defaultConfiguration": {
                "level": "error"
              }
            },
            {
              "id": "fallow/unused-class-member",
              "shortDescription": {
                "text": "Class member is never referenced"
              },
              "fullDescription": {
                "text": "Class methods and properties that are never referenced outside the class. Private members are checked within the class scope; public members are checked project-wide."
              },
              "helpUri": "https://docs.fallow.tools/explanations/dead-code#unused-class-members",
              "defaultConfiguration": {
                "level": "error"
              }
            },
            {
              "id": "fallow/unresolved-import",
              "shortDescription": {
                "text": "Import could not be resolved"
              },
              "fullDescription": {
                "text": "Import specifiers that could not be resolved to a file on disk. Common causes: deleted files, typos in paths, missing path aliases in tsconfig, or uninstalled packages."
              },
              "helpUri": "https://docs.fallow.tools/explanations/dead-code#unresolved-imports",
              "defaultConfiguration": {
                "level": "error"
              }
            },
            {
              "id": "fallow/unlisted-dependency",
              "shortDescription": {
                "text": "Dependency used but not in package.json"
              },
              "fullDescription": {
                "text": "Packages that are imported in source code but not listed in package.json. These work by accident (hoisted from another workspace package or transitive dep) and will break in strict package managers."
              },
              "helpUri": "https://docs.fallow.tools/explanations/dead-code#unlisted-dependencies",
              "defaultConfiguration": {
                "level": "error"
              }
            },
            {
              "id": "fallow/duplicate-export",
              "shortDescription": {
                "text": "Export name appears in multiple modules"
              },
              "fullDescription": {
                "text": "The same export name is defined in multiple modules. Consumers may import from the wrong module, leading to subtle bugs. Consider renaming or consolidating."
              },
              "helpUri": "https://docs.fallow.tools/explanations/dead-code#duplicate-exports",
              "defaultConfiguration": {
                "level": "error"
              }
            },
            {
              "id": "fallow/circular-dependency",
              "shortDescription": {
                "text": "Circular dependency chain detected"
              },
              "fullDescription": {
                "text": "A cycle in the module import graph. Circular dependencies cause undefined behavior with CommonJS (partial modules) and initialization ordering issues with ESM. Break cycles by extracting shared code."
              },
              "helpUri": "https://docs.fallow.tools/explanations/dead-code#circular-dependencies",
              "defaultConfiguration": {
                "level": "error"
              }
            },
            {
              "id": "fallow/boundary-violation",
              "shortDescription": {
                "text": "Import crosses a configured architecture boundary"
              },
              "fullDescription": {
                "text": "A module imports from a zone that its configured boundary rules do not allow. Boundary checks help keep layered architecture, feature slices, and package ownership rules enforceable."
              },
              "helpUri": "https://docs.fallow.tools/explanations/dead-code#boundary-violations",
              "defaultConfiguration": {
                "level": "error"
              }
            },
            {
              "id": "fallow/stale-suppression",
              "shortDescription": {
                "text": "Suppression comment or tag no longer matches any issue"
              },
              "fullDescription": {
                "text": "A fallow-ignore-next-line, fallow-ignore-file, or @expected-unused suppression that no longer matches any active issue. The underlying problem was fixed but the suppression was left behind. Remove it to keep the codebase clean."
              },
              "helpUri": "https://docs.fallow.tools/explanations/dead-code#stale-suppressions",
              "defaultConfiguration": {
                "level": "warning"
              }
            },
            {
              "id": "fallow/unused-catalog-entry",
              "shortDescription": {
                "text": "Catalog entry in pnpm-workspace.yaml not referenced by any workspace package"
              },
              "fullDescription": {
                "text": "An entry in the `catalog:` or `catalogs:` section of pnpm-workspace.yaml that no workspace package.json references via the `catalog:` protocol. Catalog entries are leftover dependency metadata once a package is removed from every consumer; delete the entry to keep the catalog truthful. See also: fallow/unresolved-catalog-reference (the inverse: consumer references a catalog that does not declare the package)."
              },
              "helpUri": "https://docs.fallow.tools/explanations/dead-code#unused-catalog-entries",
              "defaultConfiguration": {
                "level": "warning"
              }
            },
            {
              "id": "fallow/empty-catalog-group",
              "shortDescription": {
                "text": "Named catalog group in pnpm-workspace.yaml has no entries"
              },
              "fullDescription": {
                "text": "A named group under `catalogs:` in pnpm-workspace.yaml has no package entries. Empty named groups are leftover catalog structure after the last entry is removed. The top-level `catalog:` map is intentionally ignored because some projects keep it as a stable hook."
              },
              "helpUri": "https://docs.fallow.tools/explanations/dead-code#empty-catalog-groups",
              "defaultConfiguration": {
                "level": "warning"
              }
            },
            {
              "id": "fallow/unresolved-catalog-reference",
              "shortDescription": {
                "text": "package.json references a catalog that does not declare the package"
              },
              "fullDescription": {
                "text": "A workspace package.json declares a dependency with the `catalog:` or `catalog:<name>` protocol, but the catalog has no entry for that package. `pnpm install` will fail with ERR_PNPM_CATALOG_ENTRY_NOT_FOUND_FOR_CATALOG_PROTOCOL. To fix: add the package to the named catalog, switch the reference to a different catalog that does declare it, or remove the reference and pin a hardcoded version. Scope: the detector scans `dependencies`, `devDependencies`, `peerDependencies`, and `optionalDependencies` in every workspace `package.json`. See also: fallow/unused-catalog-entry (the inverse: catalog entries no consumer references)."
              },
              "helpUri": "https://docs.fallow.tools/explanations/dead-code#unresolved-catalog-references",
              "defaultConfiguration": {
                "level": "error"
              }
            },
            {
              "id": "fallow/unused-dependency-override",
              "shortDescription": {
                "text": "pnpm.overrides entry targets a package not declared or resolved"
              },
              "fullDescription": {
                "text": "An entry in `pnpm-workspace.yaml`'s `overrides:` section, or the root `package.json`'s `pnpm.overrides` block, whose target package is not declared by any workspace package and is not present in `pnpm-lock.yaml`. Override entries linger after their target package leaves the resolved dependency tree. For projects without a readable lockfile, fallow falls back to workspace package.json manifests and keeps a `hint` so transitive CVE pins can be reviewed before removal. To fix: delete the entry, refresh `pnpm-lock.yaml` if it is stale, or add the entry to `ignoreDependencyOverrides` when the override is intentionally retained. See also: fallow/misconfigured-dependency-override."
              },
              "helpUri": "https://docs.fallow.tools/explanations/dead-code#unused-dependency-overrides",
              "defaultConfiguration": {
                "level": "warning"
              }
            },
            {
              "id": "fallow/misconfigured-dependency-override",
              "shortDescription": {
                "text": "pnpm.overrides entry has an unparsable key or value"
              },
              "fullDescription": {
                "text": "An entry in `pnpm-workspace.yaml`'s `overrides:` or `package.json`'s `pnpm.overrides` whose key or value does not parse as a valid pnpm override spec. Common shapes: empty key, empty value, malformed version selector on the target (`@types/react@<<18`), unbalanced parent matcher (`react>`), or unsupported `npm:alias@` syntax in the version (only the `-`, `$ref`, and `npm:alias`pnpm idioms are allowed). pnpm rejects the workspace at install time with a parser error. To fix: correct the key/value shape, or remove the entry. See also: fallow/unused-dependency-override."
              },
              "helpUri": "https://docs.fallow.tools/explanations/dead-code#misconfigured-dependency-overrides",
              "defaultConfiguration": {
                "level": "error"
              }
            }
          ]
        }
      },
      "results": []
    },
    {
      "tool": {
        "driver": {
          "name": "fallow",
          "version": "2.74.0",
          "informationUri": "https://github.com/fallow-rs/fallow",
          "rules": [
            {
              "id": "fallow/high-cyclomatic-complexity",
              "shortDescription": {
                "text": "Function has high cyclomatic complexity"
              },
              "fullDescription": {
                "text": "McCabe cyclomatic complexity exceeds the configured threshold. Cyclomatic complexity counts the number of independent paths through a function (1 + decision points: if/else, switch cases, loops, ternary, logical operators). High values indicate functions that are hard to test exhaustively."
              },
              "helpUri": "https://docs.fallow.tools/explanations/health#cyclomatic-complexity",
              "defaultConfiguration": {
                "level": "note"
              }
            },
            {
              "id": "fallow/high-cognitive-complexity",
              "shortDescription": {
                "text": "Function has high cognitive complexity"
              },
              "fullDescription": {
                "text": "SonarSource cognitive complexity exceeds the configured threshold. Unlike cyclomatic complexity, cognitive complexity penalizes nesting depth and non-linear control flow (breaks, continues, early returns). It measures how hard a function is to understand when reading sequentially."
              },
              "helpUri": "https://docs.fallow.tools/explanations/health#cognitive-complexity",
              "defaultConfiguration": {
                "level": "note"
              }
            },
            {
              "id": "fallow/high-complexity",
              "shortDescription": {
                "text": "Function exceeds both complexity thresholds"
              },
              "fullDescription": {
                "text": "Function exceeds both cyclomatic and cognitive complexity thresholds. This is the strongest signal that a function needs refactoring, it has many paths AND is hard to understand."
              },
              "helpUri": "https://docs.fallow.tools/explanations/health#complexity-metrics",
              "defaultConfiguration": {
                "level": "note"
              }
            },
            {
              "id": "fallow/high-crap-score",
              "shortDescription": {
                "text": "Function has a high CRAP score (complexity combined with low coverage)"
              },
              "fullDescription": {
                "text": "The function's CRAP (Change Risk Anti-Patterns) score meets or exceeds the configured threshold. CRAP combines cyclomatic complexity with test coverage using the Savoia and Evans (2007) formula:`CC^2 \* (1 - coverage/100)^3 + CC`. High CRAP indicates changes to this function carry high risk because it is complex AND poorly tested. Pair with `--coverage`for accurate per-function scoring; without it fallow estimates coverage from the module graph."
              },
              "helpUri": "https://docs.fallow.tools/explanations/health#crap-score",
              "defaultConfiguration": {
                "level": "warning"
              }
            },
            {
              "id": "fallow/refactoring-target",
              "shortDescription": {
                "text": "File identified as a high-priority refactoring candidate"
              },
              "fullDescription": {
                "text": "File identified as a refactoring candidate based on a weighted combination of complexity density, churn velocity, dead code ratio, fan-in (blast radius), and fan-out (coupling). Categories: urgent churn+complexity, break circular dependency, split high-impact file, remove dead code, extract complex functions, reduce coupling."
              },
              "helpUri": "https://docs.fallow.tools/explanations/health#refactoring-targets",
              "defaultConfiguration": {
                "level": "warning"
              }
            },
            {
              "id": "fallow/untested-file",
              "shortDescription": {
                "text": "Runtime-reachable file has no test dependency path"
              },
              "fullDescription": {
                "text": "A file is reachable from runtime entry points but not from any discovered test entry point. This indicates production code that no test imports, directly or transitively, according to the static module graph."
              },
              "helpUri": "https://docs.fallow.tools/explanations/health#coverage-gaps",
              "defaultConfiguration": {
                "level": "warning"
              }
            },
            {
              "id": "fallow/untested-export",
              "shortDescription": {
                "text": "Runtime-reachable export has no test dependency path"
              },
              "fullDescription": {
                "text": "A value export is reachable from runtime entry points but no test-reachable module references it. This is a static test dependency gap rather than line coverage, and highlights exports exercised only through production entry paths."
              },
              "helpUri": "https://docs.fallow.tools/explanations/health#coverage-gaps",
              "defaultConfiguration": {
                "level": "warning"
              }
            },
            {
              "id": "fallow/runtime-safe-to-delete",
              "shortDescription": {
                "text": "Statically unused AND never invoked in production with V8 tracking"
              },
              "fullDescription": {
                "text": "The function is both statically unreachable in the module graph and was never invoked during the observed runtime coverage window. This is the highest-confidence delete signal fallow emits."
              },
              "helpUri": "https://docs.fallow.tools/explanations/health#runtime-coverage",
              "defaultConfiguration": {
                "level": "warning"
              }
            },
            {
              "id": "fallow/runtime-review-required",
              "shortDescription": {
                "text": "Statically used but never invoked in production"
              },
              "fullDescription": {
                "text": "The function is reachable in the module graph (or exercised by tests / untracked call sites) but was not invoked during the observed runtime coverage window. Needs a human look: may be seasonal, error-path only, or legitimately unused."
              },
              "helpUri": "https://docs.fallow.tools/explanations/health#runtime-coverage",
              "defaultConfiguration": {
                "level": "warning"
              }
            },
            {
              "id": "fallow/runtime-low-traffic",
              "shortDescription": {
                "text": "Function was invoked below the low-traffic threshold"
              },
              "fullDescription": {
                "text": "The function was invoked in production but below the configured`--low-traffic-threshold`fraction of total trace count (spec default 0.1%). Effectively dead for the current period."
              },
              "helpUri": "https://docs.fallow.tools/explanations/health#runtime-coverage",
              "defaultConfiguration": {
                "level": "note"
              }
            },
            {
              "id": "fallow/runtime-coverage-unavailable",
              "shortDescription": {
                "text": "Runtime coverage could not be resolved for this function"
              },
              "fullDescription": {
                "text": "The function could not be matched to a V8-tracked coverage entry. Common causes: the function lives in a worker thread (separate V8 isolate), it is lazy-parsed and never reached the JIT tier, or its source map did not resolve to the expected source path. This is advisory, not a dead-code signal."
              },
              "helpUri": "https://docs.fallow.tools/explanations/health#runtime-coverage",
              "defaultConfiguration": {
                "level": "note"
              }
            },
            {
              "id": "fallow/runtime-coverage",
              "shortDescription": {
                "text": "Runtime coverage finding"
              },
              "fullDescription": {
                "text": "Generic runtime-coverage finding for verdicts not covered by a more specific rule. Covers the forward-compat`unknown`sentinel; the CLI filters`active`entries out of`runtime_coverage.findings` so the surfaced list stays actionable."
},
"helpUri": "https://docs.fallow.tools/explanations/health#runtime-coverage",
"defaultConfiguration": {
"level": "note"
}
}
]
}
},
"results": []
}
]
}

## DEAD

{
"$schema": "https://json.schemastore.org/sarif-2.1.0.json",
  "version": "2.1.0",
  "runs": [
    {
      "tool": {
        "driver": {
          "name": "fallow",
          "version": "2.74.0",
          "informationUri": "https://github.com/fallow-rs/fallow",
          "rules": [
            {
              "id": "fallow/unused-file",
              "shortDescription": {
                "text": "File is not reachable from any entry point"
              },
              "fullDescription": {
                "text": "Source files that are not imported by any other module and are not entry points (scripts, tests, configs). These files can safely be deleted. Detection uses graph reachability from configured entry points."
              },
              "helpUri": "https://docs.fallow.tools/explanations/dead-code#unused-files",
              "defaultConfiguration": {
                "level": "error"
              }
            },
            {
              "id": "fallow/unused-export",
              "shortDescription": {
                "text": "Export is never imported"
              },
              "fullDescription": {
                "text": "Named exports that are never imported by any other module in the project. Includes both direct exports and re-exports through barrel files. The export may still be used locally within the same file."
              },
              "helpUri": "https://docs.fallow.tools/explanations/dead-code#unused-exports",
              "defaultConfiguration": {
                "level": "error"
              }
            },
            {
              "id": "fallow/unused-type",
              "shortDescription": {
                "text": "Type export is never imported"
              },
              "fullDescription": {
                "text": "Type-only exports (interfaces, type aliases, enums used only as types) that are never imported. These do not generate runtime code but add maintenance burden."
              },
              "helpUri": "https://docs.fallow.tools/explanations/dead-code#unused-types",
              "defaultConfiguration": {
                "level": "error"
              }
            },
            {
              "id": "fallow/private-type-leak",
              "shortDescription": {
                "text": "Exported signature references a private type"
              },
              "fullDescription": {
                "text": "Exported values or types whose public TypeScript signature references a same-file type declaration that is not exported. Consumers cannot name that private type directly, so the backing type should be exported or removed from the public signature."
              },
              "helpUri": "https://docs.fallow.tools/explanations/dead-code#private-type-leaks",
              "defaultConfiguration": {
                "level": "none"
              }
            },
            {
              "id": "fallow/unused-dependency",
              "shortDescription": {
                "text": "Dependency listed but never imported"
              },
              "fullDescription": {
                "text": "Packages listed in dependencies that are never imported or required by any source file. Framework plugins and CLI tools may be false positives; use the ignore_dependencies config to suppress."
              },
              "helpUri": "https://docs.fallow.tools/explanations/dead-code#unused-dependencies",
              "defaultConfiguration": {
                "level": "error"
              }
            },
            {
              "id": "fallow/unused-dev-dependency",
              "shortDescription": {
                "text": "Dev dependency listed but never imported"
              },
              "fullDescription": {
                "text": "Packages listed in devDependencies that are never imported by test files, config files, or scripts. Build tools and jest presets that are referenced only in config may appear as false positives."
              },
              "helpUri": "https://docs.fallow.tools/explanations/dead-code#unused-devdependencies",
              "defaultConfiguration": {
                "level": "warning"
              }
            },
            {
              "id": "fallow/unused-optional-dependency",
              "shortDescription": {
                "text": "Optional dependency listed but never imported"
              },
              "fullDescription": {
                "text": "Packages listed in optionalDependencies that are never imported. Optional dependencies are typically platform-specific; verify they are not needed on any supported platform before removing."
              },
              "helpUri": "https://docs.fallow.tools/explanations/dead-code#unused-optionaldependencies",
              "defaultConfiguration": {
                "level": "warning"
              }
            },
            {
              "id": "fallow/type-only-dependency",
              "shortDescription": {
                "text": "Production dependency only used via type-only imports"
              },
              "fullDescription": {
                "text": "Production dependencies that are only imported via `import type` statements. These can be moved to devDependencies since they generate no runtime code and are stripped during compilation."
              },
              "helpUri": "https://docs.fallow.tools/explanations/dead-code#type-only-dependencies",
              "defaultConfiguration": {
                "level": "warning"
              }
            },
            {
              "id": "fallow/test-only-dependency",
              "shortDescription": {
                "text": "Production dependency only imported by test files"
              },
              "fullDescription": {
                "text": "Production dependencies that are only imported from test files. These can usually move to devDependencies because production entry points do not require them at runtime."
              },
              "helpUri": "https://docs.fallow.tools/explanations/dead-code#test-only-dependencies",
              "defaultConfiguration": {
                "level": "warning"
              }
            },
            {
              "id": "fallow/unused-enum-member",
              "shortDescription": {
                "text": "Enum member is never referenced"
              },
              "fullDescription": {
                "text": "Enum members that are never referenced in the codebase. Uses scope-aware binding analysis to track all references including computed access patterns."
              },
              "helpUri": "https://docs.fallow.tools/explanations/dead-code#unused-enum-members",
              "defaultConfiguration": {
                "level": "error"
              }
            },
            {
              "id": "fallow/unused-class-member",
              "shortDescription": {
                "text": "Class member is never referenced"
              },
              "fullDescription": {
                "text": "Class methods and properties that are never referenced outside the class. Private members are checked within the class scope; public members are checked project-wide."
              },
              "helpUri": "https://docs.fallow.tools/explanations/dead-code#unused-class-members",
              "defaultConfiguration": {
                "level": "error"
              }
            },
            {
              "id": "fallow/unresolved-import",
              "shortDescription": {
                "text": "Import could not be resolved"
              },
              "fullDescription": {
                "text": "Import specifiers that could not be resolved to a file on disk. Common causes: deleted files, typos in paths, missing path aliases in tsconfig, or uninstalled packages."
              },
              "helpUri": "https://docs.fallow.tools/explanations/dead-code#unresolved-imports",
              "defaultConfiguration": {
                "level": "error"
              }
            },
            {
              "id": "fallow/unlisted-dependency",
              "shortDescription": {
                "text": "Dependency used but not in package.json"
              },
              "fullDescription": {
                "text": "Packages that are imported in source code but not listed in package.json. These work by accident (hoisted from another workspace package or transitive dep) and will break in strict package managers."
              },
              "helpUri": "https://docs.fallow.tools/explanations/dead-code#unlisted-dependencies",
              "defaultConfiguration": {
                "level": "error"
              }
            },
            {
              "id": "fallow/duplicate-export",
              "shortDescription": {
                "text": "Export name appears in multiple modules"
              },
              "fullDescription": {
                "text": "The same export name is defined in multiple modules. Consumers may import from the wrong module, leading to subtle bugs. Consider renaming or consolidating."
              },
              "helpUri": "https://docs.fallow.tools/explanations/dead-code#duplicate-exports",
              "defaultConfiguration": {
                "level": "error"
              }
            },
            {
              "id": "fallow/circular-dependency",
              "shortDescription": {
                "text": "Circular dependency chain detected"
              },
              "fullDescription": {
                "text": "A cycle in the module import graph. Circular dependencies cause undefined behavior with CommonJS (partial modules) and initialization ordering issues with ESM. Break cycles by extracting shared code."
              },
              "helpUri": "https://docs.fallow.tools/explanations/dead-code#circular-dependencies",
              "defaultConfiguration": {
                "level": "error"
              }
            },
            {
              "id": "fallow/boundary-violation",
              "shortDescription": {
                "text": "Import crosses a configured architecture boundary"
              },
              "fullDescription": {
                "text": "A module imports from a zone that its configured boundary rules do not allow. Boundary checks help keep layered architecture, feature slices, and package ownership rules enforceable."
              },
              "helpUri": "https://docs.fallow.tools/explanations/dead-code#boundary-violations",
              "defaultConfiguration": {
                "level": "error"
              }
            },
            {
              "id": "fallow/stale-suppression",
              "shortDescription": {
                "text": "Suppression comment or tag no longer matches any issue"
              },
              "fullDescription": {
                "text": "A fallow-ignore-next-line, fallow-ignore-file, or @expected-unused suppression that no longer matches any active issue. The underlying problem was fixed but the suppression was left behind. Remove it to keep the codebase clean."
              },
              "helpUri": "https://docs.fallow.tools/explanations/dead-code#stale-suppressions",
              "defaultConfiguration": {
                "level": "warning"
              }
            },
            {
              "id": "fallow/unused-catalog-entry",
              "shortDescription": {
                "text": "Catalog entry in pnpm-workspace.yaml not referenced by any workspace package"
              },
              "fullDescription": {
                "text": "An entry in the `catalog:` or `catalogs:` section of pnpm-workspace.yaml that no workspace package.json references via the `catalog:` protocol. Catalog entries are leftover dependency metadata once a package is removed from every consumer; delete the entry to keep the catalog truthful. See also: fallow/unresolved-catalog-reference (the inverse: consumer references a catalog that does not declare the package)."
              },
              "helpUri": "https://docs.fallow.tools/explanations/dead-code#unused-catalog-entries",
              "defaultConfiguration": {
                "level": "warning"
              }
            },
            {
              "id": "fallow/empty-catalog-group",
              "shortDescription": {
                "text": "Named catalog group in pnpm-workspace.yaml has no entries"
              },
              "fullDescription": {
                "text": "A named group under `catalogs:` in pnpm-workspace.yaml has no package entries. Empty named groups are leftover catalog structure after the last entry is removed. The top-level `catalog:` map is intentionally ignored because some projects keep it as a stable hook."
              },
              "helpUri": "https://docs.fallow.tools/explanations/dead-code#empty-catalog-groups",
              "defaultConfiguration": {
                "level": "warning"
              }
            },
            {
              "id": "fallow/unresolved-catalog-reference",
              "shortDescription": {
                "text": "package.json references a catalog that does not declare the package"
              },
              "fullDescription": {
                "text": "A workspace package.json declares a dependency with the `catalog:` or `catalog:<name>` protocol, but the catalog has no entry for that package. `pnpm install` will fail with ERR_PNPM_CATALOG_ENTRY_NOT_FOUND_FOR_CATALOG_PROTOCOL. To fix: add the package to the named catalog, switch the reference to a different catalog that does declare it, or remove the reference and pin a hardcoded version. Scope: the detector scans `dependencies`, `devDependencies`, `peerDependencies`, and `optionalDependencies` in every workspace `package.json`. See also: fallow/unused-catalog-entry (the inverse: catalog entries no consumer references)."
              },
              "helpUri": "https://docs.fallow.tools/explanations/dead-code#unresolved-catalog-references",
              "defaultConfiguration": {
                "level": "error"
              }
            },
            {
              "id": "fallow/unused-dependency-override",
              "shortDescription": {
                "text": "pnpm.overrides entry targets a package not declared or resolved"
              },
              "fullDescription": {
                "text": "An entry in `pnpm-workspace.yaml`'s `overrides:` section, or the root `package.json`'s `pnpm.overrides` block, whose target package is not declared by any workspace package and is not present in `pnpm-lock.yaml`. Override entries linger after their target package leaves the resolved dependency tree. For projects without a readable lockfile, fallow falls back to workspace package.json manifests and keeps a `hint` so transitive CVE pins can be reviewed before removal. To fix: delete the entry, refresh `pnpm-lock.yaml` if it is stale, or add the entry to `ignoreDependencyOverrides` when the override is intentionally retained. See also: fallow/misconfigured-dependency-override."
              },
              "helpUri": "https://docs.fallow.tools/explanations/dead-code#unused-dependency-overrides",
              "defaultConfiguration": {
                "level": "warning"
              }
            },
            {
              "id": "fallow/misconfigured-dependency-override",
              "shortDescription": {
                "text": "pnpm.overrides entry has an unparsable key or value"
              },
              "fullDescription": {
                "text": "An entry in `pnpm-workspace.yaml`'s `overrides:` or `package.json`'s `pnpm.overrides` whose key or value does not parse as a valid pnpm override spec. Common shapes: empty key, empty value, malformed version selector on the target (`@types/react@<<18`), unbalanced parent matcher (`react>`), or unsupported `npm:alias@` syntax in the version (only the `-`, `$ref`, and `npm:alias` pnpm idioms are allowed). pnpm rejects the workspace at install time with a parser error. To fix: correct the key/value shape, or remove the entry. See also: fallow/unused-dependency-override."
},
"helpUri": "https://docs.fallow.tools/explanations/dead-code#misconfigured-dependency-overrides",
"defaultConfiguration": {
"level": "error"
}
}
]
}
},
"results": []
}
]
}

## DUPLICATION

{
"$schema": "https://json.schemastore.org/sarif-2.1.0.json",
"version": "2.1.0",
"runs": [
{
"tool": {
"driver": {
"name": "fallow",
"version": "2.74.0",
"informationUri": "https://github.com/fallow-rs/fallow",
"rules": [
{
"id": "fallow/code-duplication",
"shortDescription": {
"text": "Duplicated code block"
},
"fullDescription": {
"text": "A block of code that appears in multiple locations with identical or near-identical token sequences. Clone detection uses normalized token comparison: identifier names and literals are abstracted away in non-strict modes."
},
"helpUri": "https://docs.fallow.tools/explanations/duplication#clone-groups",
"defaultConfiguration": {
"level": "warning"
}
}
]
}
},
"results": []
}
]
}

## DOCSTRINGS

{"version":"2.1.0","$schema":"https://json.schemastore.org/sarif-2.1.0.json","runs":[{"tool":{"driver":{"name":"scribe","rules":[{"id":"missing-docstring","shortDescription":{"text":"Missing public symbol documentation"}}]}},"results":[]}]}
