# Swimlane orientation and lanes

Three native containers compare horizontal rows, vertical columns, unequal lane
sizes and a collapsed Review lane. Nine original cards have real `parentId` and
`laneId` membership. Collapse is not deletion. This is separate from ordinary
grouping and from the existing alignment/spacing gallery.

Right-click a lane header to explore its native menu. Expand Review in the bottom
container to expose Compare dyes. Rename a lane without changing its ID, or move
it before another lane. Static container titles describe the initial specimens.

## Literal Facade recipes

Expand a lane while retaining its children:

```ts
const board = univerAPI.getActiveBoard()
console.log(board.setSwimlaneLaneCollapsed('unequal', 'review', false))
console.log(board.getContainerChildren('unequal').map(child => [child.id, child.laneId]))
```

Rename a lane, preserving membership:

```ts
const board = univerAPI.getActiveBoard()
console.log(board.renameSwimlaneLane('horizontal', 'review', 'Quality check'))
console.log(board.getElement('horizontal').containerData.swimlane)
```

Reorder a lane by stable ID:

```ts
const board = univerAPI.getActiveBoard()
console.log(board.reorderSwimlaneLane('vertical', 'ready', 0))
console.log(board.getElement('vertical').containerData.swimlane.lanes)
```

Change one lane size in Board coordinates:

```ts
const board = univerAPI.getActiveBoard()
console.log(board.setSwimlaneLaneSize('horizontal', 'intake', 120))
console.log(board.getElement('horizontal').containerData.swimlane.lanes)
```

## Scope

Factories and exported SDK geometry helpers author the initial native snapshot;
the four runtime edits use public Facades. Initial viewport fitting uses the
exported Board viewport service, not a custom renderer. Preview and standalone
export include eight complete English packs and eight official stylesheets.
Board owns its native toolbar; the office UI is configured as Grid without
adding a second ribbon. No host action bar or SDK modifications.

Locked lanes reject mutations; removing an occupied lane requires a deliberate
content policy. These boundaries, arbitrary drag membership, lane-gap behavior,
save/reconstruction and native history need separate acceptance. No automatic
workflow engine, scheduling logic or cross-product data binding is implied.
