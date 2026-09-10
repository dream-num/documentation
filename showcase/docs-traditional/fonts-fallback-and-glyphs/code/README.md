# Fonts, fallback and glyphs

Current language contract: native UI, instructions and specimen headings are English under either host language. International glyph specimens remain intentionally multilingual; they test font/script coverage and are not localized instructions. Earlier bilingual acceptance is historical. The full English Docs Core locale pack and official CSS remain in the independent export. The legacy locale and data-language argument positions remain accepted but do not switch the instructions.

Two authored pages compare four requested font stacks, regular 12 pt / bold 18 pt, and six script specimens in native traditional Docs. Select text and use the Grid ribbon. Theme changes retain edits; no duplicate host controls, fixture selectors, JSON panels or custom demo commands remain.

The requested stacks are Arial/sans-serif, Georgia/serif, Courier New/monospace and an intentionally absent primary followed by Georgia/serif. Latin, CJK, Arabic/Hebrew, composed/decomposed accents, symbols and private-use U+10FFFD remain editable text. Font-size edits may produce additional physical pages.

No font files are downloaded or bundled. A requested family does not identify the actual font used per glyph. RTL shaping/selection and glyph coverage need platform-specific visual checks. Private-use characters have no universal expected glyph; nonzero width is not a coverage certificate.

Preview and standalone share createDemo(), FUniver.createDocument(), the complete English Docs Core locale pack and official Docs Core CSS. DevTools can inspect window.univerAPI.getActiveDocument().save(). No unrelated Pro table/drawing plugins are needed.
