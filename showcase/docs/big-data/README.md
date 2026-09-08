# Large document — native editing

The shared factory loads the complete original `DOCS_BIG_DATA` snapshot. It
enables editing and supplies the stable section identity required by the
installed SDK; it does not shorten the text, remove styles, or replace the
fixture. The original `data.ts` remains unchanged.

Preview retains one SDK owner across theme changes. The source export includes
the same factory, the complete official English Docs Core locale bundle, official preset CSS,
and local container sizing/font CSS.

`navigationToSteadyMs` is a single local browser observation that includes
development module loading. It is not a controlled performance benchmark,
maximum-size claim, memory measurement, scroll-FPS measurement, or proof of
layout correctness on every page. Production export and broad performance
acceptance are separate checks.
