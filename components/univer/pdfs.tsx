'use client'

import { UniverPdfsPlugin } from '@univerjs-pro/pdfs'
import { UniverPdfEditorPlugin } from '@univerjs-pro/pdfs-editor'
import { UniverPdfsUIPlugin } from '@univerjs-pro/pdfs-ui'
import PdfsUIEnUS from '@univerjs-pro/pdfs-ui/locale/en-US'
import { mergeLocales } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'
import { useCallback } from 'react'
import type { IUniverCanvasProps } from './canvas'
import { UniverCanvas } from './canvas'
import '@univerjs-pro/pdfs-ui/lib/index.css'
import '@univerjs-pro/pdfs/facade'

const locales = mergeLocales(PdfsUIEnUS)

export default function PdfsDemo() {
  const seedPdf = useCallback((univerAPI: ReturnType<typeof FUniver.newAPI>) => {
    const pdf = univerAPI.createPdf({
      id: 'pdfs-home-demo',
      name: 'Univer PDFs · An editable field guide',
    })
    const cover = pdf.getPageByIndex(0)
    if (!cover) return

    const ink = '#182433'
    const muted = '#5A6878'
    const blue = '#174A7E'
    const cyan = '#24748A'
    const accent = '#B45336'
    const rule = '#CBD3DC'
    const soft = '#EDF2F5'
    const serif = 'Times New Roman'
    const sans = 'Helvetica'
    const bodyFontSize = 10.5
    const leadFontSize = 11.5
    const captionFontSize = 8.5
    const labelFontSize = 9
    const tablePresets = univerAPI.getPdfTableThemePresets()
    const horizontalTablePreset = tablePresets.find(({ id }) => id === 'univerNeutralHorizontalLines')
    const softTablePreset = tablePresets.find(({ id }) => id === 'univerNeutralSoftGrid')

    const addPageFrame = (page: typeof cover, pageNumber: number, section: string) => {
      page
        .insertTextBox({
          text: `UNIVER PDFs  /  ${section}`,
          left: 42,
          top: 24,
          width: 420,
          height: 16,
          fontSize: 7.5,
          fontFamily: sans,
          fill: blue,
        })
        .setTextStyle({ bold: true, charSpacing: 1 })
      page
        .insertTextBox({
          text: String(pageNumber).padStart(2, '0'),
          left: 512,
          top: 22,
          width: 40,
          height: 18,
          fontSize: 9,
          fontFamily: sans,
          fill: muted,
        })
        .setTextStyle({ bold: true, charSpacing: 1 })
      page.insertDivider({
        left: 42,
        top: 48,
        width: 511,
        strokeColor: rule,
        strokeWidth: 0.7,
      })
      page.insertDivider({
        left: 42,
        top: 786,
        width: 511,
        strokeColor: rule,
        strokeWidth: 0.7,
      })
      page.insertTextBox({
        text: 'UNIVER PDFs  ·  An editable product guide  ·  docs.univer.ai',
        left: 42,
        top: 798,
        width: 390,
        height: 14,
        fontSize: 7,
        fontFamily: sans,
        fill: muted,
      })
      page.insertTextBox({
        text: `PAGE ${String(pageNumber).padStart(2, '0')}`,
        left: 492,
        top: 798,
        width: 60,
        height: 14,
        fontSize: 7,
        fontFamily: sans,
        fill: muted,
      })
    }

    addPageFrame(cover, 1, 'MEET UNIVER PDFs')
    cover
      .insertTextBox({
        text: 'UNIVER PDFs  ·  CREATE, EDIT & REVIEW',
        left: 42,
        top: 74,
        width: 360,
        height: 18,
        fontSize: 8,
        fontFamily: sans,
        fill: accent,
      })
      .setTextStyle({ bold: true, charSpacing: 1.1 })
    cover
      .insertTextBox({
        text: 'A PDF can be a workspace.',
        left: 42,
        top: 102,
        width: 511,
        height: 36,
        fontSize: 25,
        fontFamily: serif,
        fill: ink,
      })
      .setTextStyle({ bold: true })
    cover
      .insertTextBox({
        text: 'Meet Univer PDFs.',
        left: 42,
        top: 140,
        width: 511,
        height: 36,
        fontSize: 25,
        fontFamily: serif,
        fill: ink,
      })
      .setTextStyle({ bold: true })
    cover.insertParagraph({
      text: 'Text, tables, lists, and annotations — brought together on editable pages.',
      left: 42,
      top: 198,
      width: 500,
      height: 34,
      fontSize: 11,
      fontFamily: serif,
      fill: muted,
    })
    cover
      .insertTextBox({
        text: 'UNIVER PDFs  /  INTERACTIVE FIELD GUIDE',
        left: 42,
        top: 244,
        width: 430,
        height: 20,
        fontSize: 9,
        fontFamily: sans,
        fill: blue,
      })
      .setTextStyle({ bold: true })
    cover.insertParagraph({
      text: 'This guide introduces the editor using its own page objects.\nSelect an object, edit its content, and explore the toolbar.',
      left: 42,
      top: 270,
      width: 500,
      height: 36,
      fontSize: 7.5,
      fontFamily: sans,
      fill: muted,
    })
    cover.insertDivider({
      left: 42,
      top: 320,
      width: 511,
      strokeColor: blue,
      strokeWidth: 1.5,
    })
    cover
      .insertTextBox({
        text: 'MEET PDFs',
        left: 42,
        top: 342,
        width: 72,
        height: 18,
        fontSize: 8,
        fontFamily: sans,
        fill: blue,
      })
      .setTextStyle({ bold: true, charSpacing: 1.2 })
    cover.insertParagraph({
      text: 'I’m Univer PDFs, a PDF workspace inside your application. This introduction is built from text boxes, paragraphs, tables, and dividers. Select a title to restyle it, edit a table cell, or add your own annotation. Each page demonstrates a different way to work: compose content, give it structure, review a detail, and organize the result. Scroll through the guide to try it for yourself. The page is the demonstration, and every object is part of the tour.',
      left: 128,
      top: 337,
      width: 425,
      height: 112,
      fontSize: bodyFontSize,
      fontFamily: serif,
      fill: ink,
    })
    cover
      .insertTextBox({
        text: 'EXPLORE',
        left: 42,
        top: 466,
        width: 72,
        height: 16,
        fontSize: 7.5,
        fontFamily: sans,
        fill: blue,
      })
      .setTextStyle({ bold: true, charSpacing: 1 })
    cover.insertParagraph({
      text: 'editable text  ·  page layout  ·  tables and lists  ·  annotations  ·  page management',
      left: 128,
      top: 462,
      width: 425,
      height: 28,
      fontSize: labelFontSize,
      fontFamily: serif,
      fill: muted,
    })
    const featureSummary = cover.insertTable({
      rowCount: 2,
      columnCount: 3,
      cellTexts: [
        'EDIT TEXT',
        'STYLE TABLES',
        'REVIEW A PAGE',
        'Titles & paragraphs',
        'Cells & alignment',
        'Highlights & underlines',
      ],
      left: 42,
      top: 508,
      width: 511,
      height: 74,
    })
    if (softTablePreset) {
      featureSummary.setTheme({ styleId: softTablePreset.id, options: { firstRow: true } })
    }
    for (let column = 0; column < 3; column += 1) {
      featureSummary.getCell(0, column).setStyle({
        fill: { color: blue },
        fontColor: '#FFFFFF',
        horizontalAlignment: univerAPI.Enum.HorizontalAlign.CENTER,
        verticalAlign: univerAPI.Enum.PdfTableCellVerticalAlign.MIDDLE,
      })
      featureSummary.getCell(1, column).setStyle({
        fill: { color: soft },
        fontColor: ink,
        horizontalAlignment: univerAPI.Enum.HorizontalAlign.CENTER,
        verticalAlign: univerAPI.Enum.PdfTableCellVerticalAlign.MIDDLE,
      })
    }
    cover
      .insertTextBox({
        text: '1  START WITH CONTENT',
        left: 42,
        top: 610,
        width: 230,
        height: 18,
        fontSize: 9,
        fontFamily: sans,
        fill: blue,
      })
      .setTextStyle({ bold: true, charSpacing: 0.7 })
    cover.insertParagraph({
      text: 'A title sets the reading order. A paragraph carries the detail. This column and the title above it are separate objects: select one and change its text, typography, or placement.',
      left: 42,
      top: 636,
      width: 242,
      height: 116,
      fontSize: bodyFontSize,
      fontFamily: serif,
      fill: ink,
    })
    cover
      .insertTextBox({
        text: 'TRY IT YOURSELF',
        left: 311,
        top: 610,
        width: 230,
        height: 18,
        fontSize: 9,
        fontFamily: sans,
        fill: blue,
      })
      .setTextStyle({ bold: true, charSpacing: 0.7 })
    cover.insertParagraph({
      text: 'Select the title, change its color, then edit a sentence in this paragraph. Use the toolbar to add another object. Scroll down to see tables, styled cells, annotations, and numbered lists.',
      left: 311,
      top: 636,
      width: 242,
      height: 116,
      fontSize: bodyFontSize,
      fontFamily: serif,
      fill: ink,
    })

    const structure = pdf.insertPage()
    addPageFrame(structure, 2, 'COMPOSE & STRUCTURE')
    structure
      .insertTextBox({
        text: '2  Build a page from useful parts',
        left: 42,
        top: 72,
        width: 511,
        height: 34,
        fontSize: 20,
        fontFamily: serif,
        fill: ink,
      })
      .setTextStyle({ bold: true })
    structure.insertParagraph({
      text: 'Give content a structure with editable text, tables, rules, and carefully placed page objects.',
      left: 42,
      top: 116,
      width: 500,
      height: 40,
      fontSize: leadFontSize,
      fontFamily: serif,
      fill: muted,
    })
    structure
      .insertTextBox({
        text: '2.1  TEXT THAT YOU CAN EDIT',
        left: 42,
        top: 174,
        width: 242,
        height: 18,
        fontSize: labelFontSize,
        fontFamily: sans,
        fill: blue,
      })
      .setTextStyle({ bold: true, charSpacing: 0.6 })
    structure.insertParagraph({
      text: 'Use a text box for a title, label, or short callout. Use a paragraph for longer content with its own position and width. Change the font, size, color, emphasis, or spacing to create a clear hierarchy.\n\nThis page combines two columns, a table, and a divider. Each part is an object you can select and move. Try changing the heading while keeping the body text in place.',
      left: 42,
      top: 200,
      width: 242,
      height: 174,
      fontSize: bodyFontSize,
      fontFamily: serif,
      fill: ink,
    })
    structure
      .insertTextBox({
        text: 'OBJECT GUIDE',
        left: 311,
        top: 174,
        width: 242,
        height: 18,
        fontSize: labelFontSize,
        fontFamily: sans,
        fill: blue,
      })
      .setTextStyle({ bold: true, charSpacing: 0.6 })
    const objectGuide = structure.insertTable({
      rowCount: 6,
      columnCount: 2,
      cellTexts: [
        'Object',
        'Use it for',
        'Text box',
        'A title or a label',
        'Paragraph',
        'Longer content',
        'Table',
        'Structured details',
        'Divider',
        'Visual separation',
        'Annotation',
        'Review & emphasis',
      ],
      left: 311,
      top: 200,
      width: 242,
      height: 174,
    })
    if (horizontalTablePreset) {
      objectGuide.setTheme({ styleId: horizontalTablePreset.id, options: { firstRow: true } })
    }
    structure.insertDivider({
      left: 42,
      top: 398,
      width: 511,
      strokeColor: rule,
      strokeWidth: 0.8,
    })
    structure
      .insertTextBox({
        text: '2.2  STYLE A DETAIL',
        left: 42,
        top: 420,
        width: 260,
        height: 18,
        fontSize: labelFontSize,
        fontFamily: sans,
        fill: blue,
      })
      .setTextStyle({ bold: true, charSpacing: 0.6 })
    structure
      .insertTextBox({
        text: 'Your content + editable objects + a clear layout = a useful PDF workspace',
        left: 66,
        top: 454,
        width: 463,
        height: 30,
        fontSize: 11,
        fontFamily: serif,
        fill: ink,
      })
      .setTextStyle({ italic: true })
    structure.insertAnnotation({
      annotationType: univerAPI.Enum.PdfAnnotationType.UNDERLINE,
      left: 64,
      top: 473,
      width: 466,
      height: 12,
      markup: { color: cyan, opacity: 0.7 },
    })
    structure
      .insertTextBox({
        text: 'TABLE 1  ·  A TABLE THAT INTRODUCES TABLES',
        left: 42,
        top: 510,
        width: 350,
        height: 18,
        fontSize: captionFontSize,
        fontFamily: sans,
        fill: muted,
      })
      .setTextStyle({ bold: true, charSpacing: 0.5 })
    const editingGuide = structure.insertTable({
      rowCount: 5,
      columnCount: 3,
      cellTexts: [
        'Feature',
        'Try this',
        'Where',
        'Cell content',
        'Edit the words in this cell',
        'This table',
        'Alignment',
        'Align text within a cell',
        'Cell style',
        'Colors',
        'Choose a fill or text color',
        'Cell style',
        'Table theme',
        'Try another table style',
        'Table tools',
      ],
      left: 42,
      top: 536,
      width: 511,
      height: 174,
    })
    if (horizontalTablePreset) {
      editingGuide.setTheme({ styleId: horizontalTablePreset.id, options: { firstRow: true } })
    }
    structure.insertParagraph({
      text: 'Try it. Select a table cell to edit its content. Explore cell alignment, colors, borders, and the table style controls.',
      left: 42,
      top: 726,
      width: 511,
      height: 38,
      fontSize: captionFontSize,
      fontFamily: serif,
      fill: muted,
    })

    const review = pdf.insertPage()
    addPageFrame(review, 3, 'REVIEW & ANNOTATE')
    review
      .insertTextBox({
        text: '3  Review what matters',
        left: 42,
        top: 72,
        width: 511,
        height: 34,
        fontSize: 20,
        fontFamily: serif,
        fill: ink,
      })
      .setTextStyle({ bold: true })
    review.insertParagraph({
      text: 'Use a visual hierarchy and markup to guide attention to the right part of a page.',
      left: 42,
      top: 116,
      width: 500,
      height: 40,
      fontSize: leadFontSize,
      fontFamily: serif,
      fill: muted,
    })
    review
      .insertTextBox({
        text: 'FIGURE 1  ·  THREE WAYS TO MARK UP A PAGE',
        left: 42,
        top: 174,
        width: 400,
        height: 18,
        fontSize: captionFontSize,
        fontFamily: sans,
        fill: muted,
      })
      .setTextStyle({ bold: true, charSpacing: 0.5 })
    const proofLines = [
      {
        label: 'REPLACE',
        text: 'A PDF is only for reading.',
        type: univerAPI.Enum.PdfAnnotationType.STRIKEOUT,
        color: '#DC2626',
        note: 'A PDF can be an editable workspace.',
      },
      {
        label: 'EMPHASIZE',
        text: 'Keep the important detail visible.',
        type: univerAPI.Enum.PdfAnnotationType.UNDERLINE,
        color: blue,
        note: 'Underline draws attention without hiding the text.',
      },
      {
        label: 'REVISIT',
        text: 'Review this paragraph with your team.',
        type: univerAPI.Enum.PdfAnnotationType.HIGHLIGHT,
        color: '#FBBF24',
        note: 'Highlights are separate objects you can move or remove.',
      },
    ] as const
    proofLines.forEach((line, index) => {
      const top = 208 + index * 64
      review
        .insertTextBox({
          text: line.label,
          left: 42,
          top,
          width: 108,
          height: 16,
          fontSize: 8,
          fontFamily: sans,
          fill: line.color,
        })
        .setTextStyle({ bold: true })
      review.insertTextBox({
        text: line.text,
        left: 170,
        top,
        width: 376,
        height: 20,
        fontSize: 11,
        fontFamily: serif,
        fill: ink,
      })
      review.insertAnnotation({
        annotationType: line.type,
        left: 168,
        top: top + 2,
        width: 292,
        height: 14,
        markup: { color: line.color, opacity: line.type === univerAPI.Enum.PdfAnnotationType.HIGHLIGHT ? 0.35 : 0.85 },
      })
      review.insertTextBox({
        text: line.note,
        left: 170,
        top: top + 25,
        width: 382,
        height: 23,
        fontSize: 8.5,
        fontFamily: sans,
        fill: muted,
      })
    })
    review
      .insertTextBox({
        text: 'TABLE 2  ·  YOUR INTERACTIVE REVIEW CHECKLIST',
        left: 42,
        top: 420,
        width: 430,
        height: 18,
        fontSize: captionFontSize,
        fontFamily: sans,
        fill: muted,
      })
      .setTextStyle({ bold: true, charSpacing: 0.5 })
    const reviewChecklist = review.insertTable({
      rowCount: 6,
      columnCount: 5,
      cellTexts: [
        'Try this',
        'Text',
        'Table',
        'Page',
        'Done?',
        'Edit a title',
        'Yes',
        '—',
        '—',
        'Try it',
        'Change a cell',
        '—',
        'Yes',
        '—',
        'Try it',
        'Add a highlight',
        '—',
        '—',
        'Yes',
        'Try it',
        'Move an object',
        'Yes',
        '—',
        'Yes',
        'Try it',
        'Add a page',
        '—',
        '—',
        'Yes',
        'Try it',
      ],
      left: 42,
      top: 446,
      width: 511,
      height: 202,
    })
    if (horizontalTablePreset) {
      reviewChecklist.setTheme({ styleId: horizontalTablePreset.id, options: { firstRow: true } })
    }
    for (let row = 0; row < 6; row += 1) {
      for (let column = 1; column < 5; column += 1) {
        reviewChecklist.getCell(row, column).setStyle({
          horizontalAlignment: univerAPI.Enum.HorizontalAlign.CENTER,
          verticalAlign: univerAPI.Enum.PdfTableCellVerticalAlign.MIDDLE,
        })
      }
    }
    review.insertAnnotation({
      annotationType: univerAPI.Enum.PdfAnnotationType.HIGHLIGHT,
      left: 40,
      top: 680,
      width: 515,
      height: 54,
      markup: { color: '#F4D97A', opacity: 0.24 },
    })
    review
      .insertTextBox({
        text: 'TRY IT  ·  This callout has a highlight annotation. Select it to explore markup, or add an annotation of your own.',
        left: 54,
        top: 693,
        width: 485,
        height: 32,
        fontSize: bodyFontSize,
        fontFamily: serif,
        fill: '#65420E',
      })
      .setTextStyle({ bold: true })

    const practice = pdf.insertPage()
    addPageFrame(practice, 4, 'YOUR TURN')
    practice
      .insertTextBox({
        text: '4  Make this guide your own',
        left: 42,
        top: 72,
        width: 511,
        height: 34,
        fontSize: 20,
        fontFamily: serif,
        fill: ink,
      })
      .setTextStyle({ bold: true })
    practice.insertParagraph({
      text: 'A useful PDF workspace lets you work with the page, from the first paragraph to the final review.',
      left: 42,
      top: 116,
      width: 500,
      height: 40,
      fontSize: leadFontSize,
      fontFamily: serif,
      fill: muted,
    })
    practice
      .insertTextBox({
        text: '4.1  COMPOSE & REFINE',
        left: 42,
        top: 176,
        width: 242,
        height: 18,
        fontSize: labelFontSize,
        fontFamily: sans,
        fill: blue,
      })
      .setTextStyle({ bold: true, charSpacing: 0.6 })
    practice.insertParagraph({
      text: 'Start with a title and a paragraph. Add a table when information needs columns, and a list when it needs a sequence. Use dividers, alignment, and spacing to guide the reader.\n\nEvery example in this guide is made from the same objects available in the editor. Select one, change it, and see the page respond.',
      left: 42,
      top: 202,
      width: 242,
      height: 174,
      fontSize: bodyFontSize,
      fontFamily: serif,
      fill: ink,
    })
    practice
      .insertTextBox({
        text: '4.2  ORGANIZE YOUR PAGES',
        left: 311,
        top: 176,
        width: 242,
        height: 18,
        fontSize: labelFontSize,
        fontFamily: sans,
        fill: blue,
      })
      .setTextStyle({ bold: true, charSpacing: 0.6 })
    practice.insertParagraph({
      text: 'Use the page controls to navigate the guide and explore page management. Add another page for your own content, duplicate a useful layout, or reorder pages to change the reading sequence.\n\nKeep a short introduction, a detailed reference, and a checklist together in one document.',
      left: 311,
      top: 202,
      width: 242,
      height: 174,
      fontSize: bodyFontSize,
      fontFamily: serif,
      fill: ink,
    })
    practice.insertDivider({
      left: 42,
      top: 400,
      width: 511,
      strokeColor: rule,
      strokeWidth: 0.8,
    })
    practice
      .insertTextBox({
        text: 'A FOUR-STEP TOUR',
        left: 42,
        top: 422,
        width: 280,
        height: 18,
        fontSize: labelFontSize,
        fontFamily: sans,
        fill: blue,
      })
      .setTextStyle({ bold: true, charSpacing: 0.6 })
    const tourSteps = [
      'Edit the cover title and write a short introduction.',
      'Change a table cell and try a different alignment.',
      'Add an annotation to a detail you want to revisit.',
      'Add a page and build a layout of your own.',
    ]
    tourSteps.forEach((text, index) => {
      practice
        .insertList({
          text,
          kind: univerAPI.Enum.PdfListKind.ORDERED,
          preset: univerAPI.Enum.PdfListPresetId.ORDERED_DECIMAL_DOT,
          left: 42,
          top: 454 + index * 29,
          width: 511,
          height: 27,
          fontSize: bodyFontSize,
          fontFamily: serif,
          fill: ink,
        })
        .setStartNumber(index + 1)
    })
    practice
      .insertTextBox({
        text: 'YOUR NEXT PAGE',
        left: 42,
        top: 596,
        width: 180,
        height: 18,
        fontSize: labelFontSize,
        fontFamily: sans,
        fill: blue,
      })
      .setTextStyle({ bold: true, charSpacing: 0.6 })
    practice.insertParagraph({
      text: 'Turn this guide into a product sheet, a how-to document, or a review checklist. Keep the structure you like, replace the words, and use the editor to make the result your own.',
      left: 42,
      top: 622,
      width: 511,
      height: 68,
      fontSize: bodyFontSize,
      fontFamily: serif,
      fill: ink,
    })
    practice
      .insertTextBox({
        text: 'KEEP EXPLORING',
        left: 42,
        top: 708,
        width: 220,
        height: 16,
        fontSize: captionFontSize,
        fontFamily: sans,
        fill: muted,
      })
      .setTextStyle({ bold: true, charSpacing: 0.5 })
    practice.insertParagraph({
      text: 'Univer PDFs · Create and edit pages, compose text, style tables, and review with annotations. Explore the other product tabs for spreadsheets, documents, presentations, structured data, and a visual canvas.',
      left: 42,
      top: 732,
      width: 511,
      height: 42,
      fontSize: captionFontSize,
      fontFamily: serif,
      fill: muted,
    })
  }, [])

  const initialize = useCallback<IUniverCanvasProps['initialize']>(
    (univer) => {
      univer.registerPlugin(UniverPdfsPlugin)
      univer.registerPlugin(UniverPdfEditorPlugin)
      univer.registerPlugin(UniverPdfsUIPlugin)
      const univerAPI = FUniver.newAPI(univer)
      seedPdf(univerAPI)
      return { api: univerAPI }
    },
    [seedPdf],
  )

  return <UniverCanvas initialize={initialize} locales={locales} />
}
