# Demo directory

The visible directory is defined in `directory.ts` and projected by `catalog.ts`.
Existing source folders and URLs stay stable: moving a navigation entry does not
copy its demo or change its capability acceptance status.

Product display names are **Boards** and **Bases**, including the
EN/ZH directory, host filters, demo menus, guides and authored example content.
Use Board / base when referring to an individual editable object.
Keep `boards`, `bases`, package imports, resource URLs, snapshot IDs and published
SDK API names unchanged. Knowledge Base and a board of directors are unrelated
business terms, not product names.

Independent demos merge narrow product-name overrides after the complete official
English locale packs. Never mutate an imported pack or replace formula help's
mathematical meaning of “base”. Run `node scripts/test-showcase-product-names.mjs`
alongside the directory test. These overrides do not rename SDK-owned Embed
thumbnail placeholders: the selected Formula Shape thumbnail still paints
“Bases”; the installed public Embed UI plugin config exposes no product-name
option. Do not patch SDK internals or disguise that remaining limitation.

- Products: Features, Showcases, Performance, in that order.
- Compose & Embed: Product Embedding, Cross-file Formula References, Showcases.
- Customization & Integration: product first (Sheets, Modern Docs, Traditional
  Docs, Slides, Boards, Bases, PDFs, Cross-product), then Customization / Integration.
  These branches go directly to demos, keeping the tree at four levels. Topic
  groups remain searchable rather than adding another level. The current CRM,
  mount/dispose, lazy-load, multiple-instance and host-event cases all use Sheets;
  multiple instances or a host application alone do not make a cross-product case.
  Empty product scopes are retained. Cards, filters and breadcrumbs identify the
  product to distinguish similarly named examples.

All six host branches are retained for composition. Host always means the outer
editor in Product Embedding, Cross-file Formula References and Showcases, not
the embedded child, formula result or data source. The detail page
separately identifies Container, Formula Target and Data Sources. Charts remain
under their actual host product, not a new product. Multi-output stories belong
to Showcases; their formulas and sources remain searchable.

Empty categories and host branches are intentional. They display “No demos yet”,
not fake links or a claim of supported SDK functionality. Performance retains
Large Samples, Benchmarks, Lifecycle & Memory; large samples are not benchmarks.
Templates are not a directory category.

Sheet-in-Sheet demos `embed/cross-unit-formula` (Harbor / Fare Sensitivity) and
`embed/sheet-to-chart` (Tide / Channel Comparison) are retired from the runtime
registry and catalog. Their source folders and regression evidence remain for
reference and recovery; they are not published demo routes. Ordinary cross-workbook
formulas and Sheets driving embedded Docs, Slides or Boards remain available.

`COMPOSITIONS` contains reviewed display relationships, not runtime state or
acceptance evidence. Update it when adding a composition case, and run
`node scripts/test-showcase-directory.mjs`. The homepage filters, sidebar and
detail classification share this directory. EN/ZH labels are supplied, with
English fallback for other locales.
