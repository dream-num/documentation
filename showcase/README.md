# Web SDK Showcase

Runnable frontend SDK examples for Sheets, modern and traditional Docs, Slides,
Boards, Bases, PDFs, and product composition. Each example's README explains its
data, public API recipes, expected behavior, and relevant limitations.

## Run an example

```sh
pnpm install --frozen-lockfile
pnpm dev:showcase sheets/formula-errors-and-recovery
```

Select only the examples needed for local development. The full directory remains
visible, but unselected previews are not compiled. Production `pnpm build` includes
the complete registered catalog when `UNIVER_SHOWCASE_DEMOS` is unset.

## Contribute an example

- Register it in `data.ts`; follow [directory rules](DIRECTORY.md).
- Use the same factory for Preview and downloadable source. Keep example data
  independent, deterministic, and fictional.
- Use official SDK styles, locale packs, and native controls. Do not patch SDK
  internals or replace missing functionality with success-looking host UI.
- Include focused API recipes, expected results, and known limitations in the
  example README. Keep investigation logs and generated reports out of it.
- Add a catalog cover only when it depicts the actual example, and reference it
  from metadata. Keep intermediate captures and reports in ignored `test-results/`.

Run `pnpm validate:showcase`, `pnpm test:showcase:directory`, and
`pnpm test:showcase:source` before submitting. Additional maintained checks are
listed in `package.json`.

Browse Compose & Embed for cross-file formula and product-embedding examples.
A registered route is not complete feature acceptance. Frontend examples do not
imply backend persistence, offline Office conversion, or production licensing;
keep these boundaries explicit per case. Internal plans and acceptance records
are maintained locally, not shipped with the demo catalog.
