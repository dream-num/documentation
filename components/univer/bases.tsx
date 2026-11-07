'use client'

import { UniverBasesPlugin } from '@univerjs-pro/bases'
import { UniverBasesUIPlugin } from '@univerjs-pro/bases-ui'
import BasesUIEnUS from '@univerjs-pro/bases-ui/locale/en-US'
import BasesEnUS from '@univerjs-pro/bases/locale/en-US'
import EmbedUnitUIEnUS from '@univerjs-pro/embed-unit-ui/locale/en-US'
import { mergeLocales } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'
import { useCallback } from 'react'
import type { IUniverCanvasProps } from './canvas'
import { UniverCanvas } from './canvas'
import '@univerjs-pro/bases-ui/lib/index.css'
import '@univerjs-pro/embed-unit-ui/lib/index.css'
import '@univerjs-pro/bases/facade'
import '@univerjs-pro/bases-ui/facade'

const locales = mergeLocales(BasesEnUS, BasesUIEnUS, EmbedUnitUIEnUS)

export default function BasesDemo() {
  const seedBase = useCallback((univerAPI: ReturnType<typeof FUniver.newAPI>) => {
    const now = Date.now()
    const today = new Date(now)
    const tourDate = (offset: number) =>
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + offset)
    const base = univerAPI.createBase({
      id: 'bases-home-demo',
      name: 'Univer Bases · Feature explorer',
      schemaVersion: 1,
      createdAt: now,
      updatedAt: now,
      tables: {},
      tableOrder: [],
    })
    const table = base.insertTable('Explore Bases', { primaryFieldName: 'Feature' })
    const status = table.addField('Your tour', univerAPI.Enum.BaseFieldType.SingleSelect, {
      field: {
        config: {
          options: [
            { id: 'explore', name: 'Explore', color: 'blue' },
            { id: 'trying', name: 'Trying it', color: 'yellow' },
            { id: 'done', name: 'Done', color: 'green' },
          ],
        },
        defaultValue: 'explore',
      },
    })
    const instruction = table.addField('Try this', univerAPI.Enum.BaseFieldType.Text)
    const category = table.addField('Category', univerAPI.Enum.BaseFieldType.SingleSelect, {
      field: {
        config: {
          options: [
            { id: 'fields', name: 'Typed fields', color: 'blue' },
            { id: 'views', name: 'Multiple views', color: 'purple' },
            { id: 'workspace', name: 'Your workspace', color: 'green' },
          ],
        },
      },
    })
    const progress = table.addField('Progress', univerAPI.Enum.BaseFieldType.Progress)
    const startDate = table.addField('Start', univerAPI.Enum.BaseFieldType.Date)
    const endDate = table.addField('Finish', univerAPI.Enum.BaseFieldType.Date)
    const tags = table.addField('Try with', univerAPI.Enum.BaseFieldType.MultiSelect, {
      field: {
        config: {
          options: [
            { id: 'edit', name: 'Edit a value', color: 'blue' },
            { id: 'drag', name: 'Drag & drop', color: 'orange' },
            { id: 'view', name: 'Switch views', color: 'purple' },
          ],
        },
      },
    })
    const minutes = table.addField('Minutes', univerAPI.Enum.BaseFieldType.Number, {
      field: { config: { pattern: '0', decimalPlaces: 0 } },
    })
    const rating = table.addField('Usefulness', univerAPI.Enum.BaseFieldType.Rating, {
      field: { config: { min: 1, max: 5 } },
    })
    const favorite = table.addField('Favorite', univerAPI.Enum.BaseFieldType.Checkbox)
    const reference = table.addField('Learn more', univerAPI.Enum.BaseFieldType.Link)
    const formulaName = table.getFormulaName()
    const remaining = table.addField('Minutes left', univerAPI.Enum.BaseFieldType.Formula, {
      field: {
        config: {
          formula: `=ROUND(${formulaName}[[#This Row],[Minutes]]*(1-${formulaName}[[#This Row],[Progress]]/100),0)`,
        },
      },
      externalReferences: [],
    })
    const records = [
      ['Single select', 'Choose a colored label in Your tour.', 'fields', 25],
      ['Progress fields', 'Edit this value to fill the progress bar.', 'fields', 65],
      ['Dates and text', 'Give this record a date and your own description.', 'fields', 40],
      ['Kanban view', 'Drag a card to another category.', 'views', 80],
      ['Calendar view', 'Open Tour calendar to see these dates.', 'views', 50],
      ['Timeline view', 'Open Tour timeline to compare date ranges.', 'views', 30],
      ['Gallery view', 'Open Feature gallery for a different card layout.', 'views', 70],
      ['Grid view', 'Open Feature grid and edit a cell.', 'workspace', 100],
      ['Multiple tables', 'Open Build your own to start another workflow.', 'workspace', 10],
      ['Multiple labels', 'Add or remove tags in Try with.', 'fields', 45],
      ['Ratings & checkboxes', 'Choose stars and save a favorite.', 'fields', 60],
      ['Computed fields', 'Change Minutes or Progress; Minutes left recalculates.', 'fields', 35],
      ['Saved filters', 'Open Still to explore: unfinished records, sorted by rating.', 'workspace', 20],
      ['Links', 'Edit the label and URL in Learn more.', 'fields', 90],
    ] as const
    table.addRecords(
      records.map(([feature, description, group, value], index) => ({
        values: {
          [table.getPrimaryFieldId()]: feature,
          [status.getId()]: index === 7 ? 'done' : 'explore',
          [instruction.getId()]: description,
          [category.getId()]: group,
          [progress.getId()]: value,
          [startDate.getId()]: tourDate(index - 6),
          [endDate.getId()]: tourDate(index - 2),
          [tags.getId()]: group === 'views' ? ['view', 'drag'] : ['edit'],
          [minutes.getId()]: 5 + (index % 4) * 5,
          [rating.getId()]: 3 + (index % 3),
          [favorite.getId()]: [0, 3, 11].includes(index),
          [reference.getId()]: { text: 'Univer documentation', url: 'https://docs.univer.ai' },
        },
      })),
    )
    const grid = table.getViewByName('Grid')
    grid?.setName('Feature grid')
    grid?.setFieldWidth(table.getPrimaryFieldId(), 180)
    grid?.setFieldWidth(instruction.getId(), 320)
    grid?.setFieldWidth(status.getId(), 120)
    grid?.setFieldWidth(category.getId(), 150)
    grid?.setFieldWidth(progress.getId(), 120)
    grid?.setFieldWidth(startDate.getId(), 110)
    grid?.setFieldWidth(endDate.getId(), 110)
    grid?.setFieldWidth(tags.getId(), 210)
    grid?.setFieldWidth(reference.getId(), 220)
    const unfinished = table.createView('Still to explore', univerAPI.Enum.BaseViewType.Grid)
    unfinished.setFilter({
      conjunction: univerAPI.Enum.BaseFilterConjunction.AND,
      conditions: [{ fieldId: status.getId(), operator: univerAPI.Enum.BaseFilterOperator.IS_NOT, operand: 'done' }],
    })
    unfinished.setSort([{ fieldId: rating.getId(), direction: univerAPI.Enum.BaseSortDirection.DESC }])

    const featureBoard = table.createView('Feature board', univerAPI.Enum.BaseViewType.Kanban, {
      view: {
        config: {
          groupFieldId: category.getId(),
          cardLayout: 'compose',
          showFieldNames: true,
          card: {
            titleFieldId: table.getPrimaryFieldId(),
            coverFieldId: null,
            fieldIds: [instruction.getId(), status.getId(), progress.getId(), remaining.getId()],
          },
        },
      },
    })
    table.createView('Tour calendar', univerAPI.Enum.BaseViewType.Calendar, {
      view: {
        config: {
          startDateFieldId: startDate.getId(),
          endDateFieldId: endDate.getId(),
          titleFieldId: table.getPrimaryFieldId(),
          colorFieldId: category.getId(),
          mode: 'month',
          displayColor: { type: 'selectField', fieldId: category.getId() },
        },
      },
    })
    table.createView('Tour timeline', univerAPI.Enum.BaseViewType.Gantt, {
      view: {
        config: {
          startDateFieldId: startDate.getId(),
          endDateFieldId: endDate.getId(),
          titleFieldId: table.getPrimaryFieldId(),
          progressFieldId: progress.getId(),
          scale: 'week',
          leftPaneWidth: 260,
          showTodayLine: true,
          showWeekend: true,
          displayColor: { type: 'selectField', fieldId: category.getId() },
        },
      },
    })
    table.createView('Feature gallery', univerAPI.Enum.BaseViewType.Gallery, {
      view: {
        config: {
          coverFieldId: null,
          cardLayout: 'compose',
          showFieldNames: true,
          cardSize: 'medium',
          card: {
            titleFieldId: table.getPrimaryFieldId(),
            coverFieldId: null,
            fieldIds: [instruction.getId(), tags.getId(), rating.getId(), favorite.getId()],
          },
        },
      },
    })
    const ideas = base.insertTable('Build your own', { primaryFieldName: 'Workflow' })
    const use = ideas.addField('Make it yours', univerAPI.Enum.BaseFieldType.Text)
    const budget = ideas.addField('Sample budget', univerAPI.Enum.BaseFieldType.Currency, {
      field: { config: { currencySymbol: '$', decimalPlaces: 2 } },
    })
    const ready = ideas.addField('Ready to try', univerAPI.Enum.BaseFieldType.Checkbox)
    const priority = ideas.addField('Priority', univerAPI.Enum.BaseFieldType.Rating, {
      field: { config: { min: 1, max: 5 } },
    })
    ideas.addRecords([
      {
        values: {
          [ideas.getPrimaryFieldId()]: 'Content calendar',
          [use.getId()]: 'Add a publishing date and switch to Calendar.',
          [budget.getId()]: 1200,
          [ready.getId()]: true,
          [priority.getId()]: 4,
        },
      },
      {
        values: {
          [ideas.getPrimaryFieldId()]: 'Project tracker',
          [use.getId()]: 'Add a status field and group cards in Kanban.',
          [budget.getId()]: 4500,
          [ready.getId()]: true,
          [priority.getId()]: 5,
        },
      },
      {
        values: {
          [ideas.getPrimaryFieldId()]: 'Resource library',
          [use.getId()]: 'Add descriptive fields and explore Gallery.',
          [budget.getId()]: 850,
          [ready.getId()]: false,
          [priority.getId()]: 3,
        },
      },
    ])
    return { tableId: table.getId(), viewId: featureBoard.getId() }
  }, [])

  const initialize = useCallback<IUniverCanvasProps['initialize']>(
    (univer) => {
      univer.registerPlugin(UniverBasesPlugin)
      univer.registerPlugin(UniverBasesUIPlugin)

      const univerAPI = FUniver.newAPI(univer)
      const result = seedBase(univerAPI)
      return {
        api: univerAPI,
        onRendered: async () => {
          const baseUI = univerAPI.getBaseUI()
          await baseUI.activateTable(result.tableId)
          await baseUI.activateView(result.viewId)
          baseUI.openLeftSidebar()
        },
      }
    },
    [seedBase],
  )

  return <UniverCanvas initialize={initialize} locales={locales} />
}
