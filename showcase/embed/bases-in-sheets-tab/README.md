# Willow / Base in Sheets Tab

An original autumn-collection procurement story pairs a 3,500-item, $38,985
landed-cost estimate with supplier operations. Six suppliers have different
payment terms, review states and notes; eight follow-ups use actual Base record
links to those suppliers. Cost changes do not approve samples or rewrite Base
records. Contact roles and owner names are local text, not directory identities.

The internal Airtable calendar reference informed the dated follow-up workflow
and wine/sand/sage visual direction. No third-party artwork or template text is
redistributed. This case uses native grids, not a simulated calendar UI.

## Native integration

SheetTab creates Supplier operations at index 1, between Landed cost and Release
checks. A local Base provider honors the child createOptions. The SDK owns the
tab and Base workbench, including Suppliers and Follow-ups navigation. There is
no Float substitute, iframe, host tab bar or fixture panel.

Preview and standalone share create-demo.ts and ten official SDK CSS imports.
The browser-only Next entry uses ssr:false; both React adapters are included as
reference text, not Vite dependencies. Sheets uses the native Grid ribbon.

## Acceptance

The first run (`embed-base-tab-first`) failed with an asynchronous LocaleService
error during disposal. In beta.2 the child React unmount is deferred past its
locale scope; this demo unmounts only its owned Base workbench first, using the
official design unmount. Selected active-child teardown now passes with no
browser errors. This is not full lifecycle or native keyboard acceptance.

The eleven-file export installs 206 packages and builds only this demo (1,845
modules). Main JS `index-YnB4tlNV.js` is 18,444.84 kB / 4,531.97 kB gzip; official
and local CSS `index-BZIZiqIc.css` is 143.11 kB / 20.19 kB gzip. The large-chunk
warning is retained. `embed-base-tab-export-parity` passes eleven-file source
parity, real canvas paint and official white/flex CSS. The subsequent README-only
evidence update is rechecked in `embed-base-tab-export-current`; runtime assets
are unchanged.

`embed-base-tab-next-settled` passes EN/ZH guide content (three variants, actions
and states each), native Base/tab navigation and official CSS with zero
browser errors. The English screenshot was visually reviewed. The preceding
`embed-base-tab-next-timing` run lost its iframe during parent navigation; the
server's first guide and playground responses took 103s and 29.4s. The selected
development chunk is 98,229,071 bytes. Warm integration does not certify cold
performance. Narrow layouts, accessibility, broader lifecycle and source failures
still require evidence.

All prices are fictional USD planning estimates, with editable freight/handling
allowances. Tax, duties, insurance and currency conversion are excluded; there is
no financial or regulatory calculation service. No backend or Exchange/Print
workflow is registered. Reload discards edits and trial markings remain visible.
