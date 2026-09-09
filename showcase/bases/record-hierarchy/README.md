# Record hierarchy

Ten original exhibition records form three roots: an exhibition with two phases and four grandchildren, an accessibility programme with one child, and an independent review. The native Grid renders the table-level Parent relationship; this is not grouping or a host-rendered tree.

Use native disclosure controls to collapse and expand branches. Edit a leaf's coordinator or planned hours without changing its parent. The Parent field is materialized by the first public hierarchy write; no manually fabricated hierarchy field is needed.

Run these recipes in order after the demo loads. Reload to restore the original tree.

## Read direct children versus all descendants

```ts
const table = univerAPI.getBase('exhibition-hierarchy').getTableById('tasks')
const parentField = table.getHierarchyFieldId()
console.log(table.getRecordById('exhibition').getChildren(parentField).map(record => record.getId()))
console.log(table.getRecordById('exhibition').getDescendants(parentField).map(record => record.getId()))
console.log(table.getRecordById('lighting').getAncestors(parentField).map(record => record.getId()))
```

Direct children are research and installation; descendants also include their four leaf records. Lighting's ancestors are installation, then exhibition.

## Move a complete branch

```ts
const table = univerAPI.getBase('exhibition-hierarchy').getTableById('tasks')
const parentField = table.getHierarchyFieldId()
table.getRecordById('research').setParent(parentField, 'accessibility')
```

Research moves with interviews and archive. Their direct parent stays research. No record, owner or hours value is recreated.

## Promote a branch to the root level

```ts
const table = univerAPI.getBase('exhibition-hierarchy').getTableById('tasks')
const parentField = table.getHierarchyFieldId()
table.getRecordById('research').setParent(parentField, null)
console.log(table.getRecordById('research').getParent(parentField))
```

The parent is null; research remains the parent of its two children.

## Reject a circular relationship

```ts
const table = univerAPI.getBase('exhibition-hierarchy').getTableById('tasks')
const parentField = table.getHierarchyFieldId()
try {
  table.getRecordById('exhibition').setParent(parentField, 'lighting')
} catch (error) {
  console.log(error.code === univerAPI.Enum.BaseHierarchyErrorCode.Cycle)
}
```

Exhibition cannot become a child of its own descendant. The SDK rejects this relation without changing the tree. These are local data-model rules, not server authorization.
