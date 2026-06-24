Migration guide — `splitzapp` store

Purpose

- Explain how to add a migration when the persisted state shape changes.

Principles

- Keep migrations pure and idempotent.
- Make migrations defensive: verify fields exist and provide sensible defaults.
- Increment `SCHEMA_VERSION` after adding migrations.

Example: add `lastSyncAt` (string) to state

1. In [store/useStore.ts](store/useStore.ts) add a migration function:

```ts
// migrate from version 1 -> 2
MIGRATIONS[1] = (oldState: any) => {
  // if the field already exists, return as-is
  if (oldState && typeof oldState === "object" && "lastSyncAt" in oldState)
    return oldState;

  // add default value
  return { ...oldState, lastSyncAt: null };
};
```

2. Bump the schema constant:

```ts
// before
const SCHEMA_VERSION = 1;

// after
const SCHEMA_VERSION = 2;
```

3. Optional: add TypeScript typing to `State` for the new field:

```ts
// in useStore.ts State type
type State = {
  ...
  lastSyncAt: string | null;
};
```

4. Test locally

- Simulate older data in a dev build (JS console or a temporary dev screen):

```js
// simulate legacy raw state (versionless)
await AsyncStorage.setItem(
  "splitzapp_state",
  JSON.stringify({
    people: [{ id: "self", name: "Me", tags: [], color: "#a78bfa" }],
    activePeopleIds: ["self"],
    items: [],
  }),
);
// then reload the app — loader will apply MIGRATIONS and re-persist a wrapped, versioned state
```

- Or simulate a wrapped older version:

```js
await AsyncStorage.setItem(
  "splitzapp_state",
  JSON.stringify({
    schemaVersion: 1,
    state: {
      /* legacy state */
    },
  }),
);
```

- After reload verify the new field is present and `splitzapp_state` in storage now has `schemaVersion: 2`.

Notes

- Write migration functions to tolerate unexpected shapes (missing arrays, nulls).
- Keep migration functions small and testable; consider writing unit tests that call migrations directly.

If you want, I can add the example migration code directly to `store/useStore.ts` (and bump `SCHEMA_VERSION`) so you can see the end-to-end change.
