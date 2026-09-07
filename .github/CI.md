# Pull request CI

`test.yml` runs three independent jobs:

- `build`: full production build of all demos, with `.next/cache` restored by
  OS, Node major, lockfile, patches and Next configuration. Each revision saves
  its own cache; production output itself is never restored.
- `static-checks`: registry, directory, types, source/CSS exports, compile-scope
  checks and repository lint. Independent checks continue after a test failure
  when dependency setup succeeded; failed steps still fail the job.
- `browser-checks`: Chromium-based style isolation and screenshot-contract
  checks. Both run even if the first fails. Fresh JSON reports are retained as
  Actions artifacts for seven days; historical tracked reports are not uploaded.

The existing `lint` check aggregates both quality jobs and fails unless both
succeed, including when a dependency is skipped or cancelled. Keep `build` and
`lint` required in branch protection. No deployment is triggered here.

New revisions cancel obsolete runs for the same workflow/event/PR or ref.
Dependency setup retains the existing pnpm store cache and uses frozen installs.
Checkout uses the read-only built-in token, not a PAT; this repository currently
tracks no submodules. No browser cache or path-based test skipping is added.

Parallel browser checks add one dependency setup but avoid hiding static results
behind a browser failure. Measure warm-cache build duration in Actions before
claiming a speedup; the first run populates the cache.

Validate workflow syntax with actionlint (tested with 1.7.12):

```sh
actionlint .github/workflows/test.yml
```

Known style-isolation failures remain blocking failures, not an allowlist. This
workflow change does not certify whole-catalog interactions or publication rights.
