# Demo directory

The visible directory is defined in `directory.ts` and projected by `catalog.ts`.
Existing source folders and URLs stay stable: moving a navigation entry does not
copy its demo or change its capability acceptance status.

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

All six host branches are retained for composition. In Product Embedding, Host
means the outer editor. In Cross-file Formula References, Host means the product
containing the formula/result, not its source or outer container. The detail page
separately identifies Container, Formula Target and Data Sources. Charts remain
under their actual host product, not a new product. Multi-output stories belong
to Showcases; their formulas and sources remain searchable.

Empty categories and host branches are intentional. They display “No demos yet”,
not fake links or a claim of supported SDK functionality. Performance retains
Large Samples, Benchmarks, Lifecycle & Memory; large samples are not benchmarks.
Templates are not a directory category.

`COMPOSITIONS` contains reviewed display relationships, not runtime state or
acceptance evidence. Update it when adding a composition case, and run
`node scripts/test-showcase-directory.mjs`. The homepage filters, sidebar and
detail classification share this directory. EN/ZH labels are supplied, with
English fallback for other locales.
