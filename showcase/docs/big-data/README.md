# Large document — native editing

The shared factory loads the complete original `DOCS_BIG_DATA` snapshot. It
enables editing and supplies the stable section identity required by the
installed SDK; it does not shorten the text, remove styles, or replace the
fixture. The original `data.ts` remains unchanged.

Preview retains one SDK owner across theme changes. The source export includes
the same factory, the complete official English Docs Core locale bundle, official preset CSS,
and local container sizing/font CSS.

The SDK stays English on every host-page language. The legacy third locale argument is accepted but ignored. The original data file is unchanged, including its font-family identifiers; those identifiers are not translated document prose. Earlier bilingual runtime reports below are historical and do not certify the English-only migration.

Run `scripts/test-docs-big-native-theme.mjs` with `SHOWCASE_VITE_MODULE` pointing
to the installed Vite entry. It compiles only this actual Preview on port 4428,
checks native text input in both locales, compares the entire edited snapshot
across dark/light themes, and checks unmount cleanup. The text stream must
remain over one million characters and match the original after removing only
the typed test marker.

`navigationToSteadyMs` is a single local browser observation that includes
development module loading. It is not a controlled performance benchmark,
maximum-size claim, memory measurement, scroll-FPS measurement, or proof of
layout correctness on every page. Production export and broad performance
acceptance are separate checks.

Earlier failed reports remain under `test-results/docs-big-native`,
`docs-big-native-focused`, and `docs-big-native-editable`. The first two could
not commit native input; enabling editing exposed the legacy snapshot's
missing section identity in the third. No SDK errors are filtered or patched.

The section-identity run then exceeded approximately four minutes during
26-character key-by-key input; its initial screenshot and failure report are
preserved in `test-results/docs-big-native-section-identity`. The final bounded
runner uses one native text-input event with the same text and a 60-second
input deadline. Even if that check passes, it does not certify rapid typing
responsiveness.

`test-results/docs-big-native-bounded/report.json` passes EN/ZH native input,
the unchanged 1,104,019-character original stream plus only the input marker,
exact full-snapshot/owner preservation across both themes, and unmount cleanup.
It records no browser errors or network writes. Navigation to Steady was
34,447ms for EN and 22,892ms for ZH in this development run; these include module
loading and are observations, not benchmark guarantees.
