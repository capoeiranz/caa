# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- `.agents/CONTEXT.md`, or
- `.agents/CONTEXT-MAP.md` if it exists — it points at one `CONTEXT.md` per context. Read each one relevant to the topic.
- `.agents/adr/` — read ADRs that touch the area you're about to work in. In multi-context repos, also check context-scoped ADR directories referenced by `.agents/CONTEXT-MAP.md`.

If any of these files don't exist, proceed silently. Don't flag their absence; don't suggest creating them upfront. The producer skill (`/grill-with-docs`) creates them lazily when terms or decisions actually get resolved.

## File structure

Single-context repo:

```
/
├── .agents/
│   ├── CONTEXT.md
│   └── adr/
│       ├── 0001-example.md
│       └── 0002-example.md
└── src/
```

Multi-context repo:

```
/
├── .agents/
│   ├── CONTEXT-MAP.md
│   └── adr/
│       └── 0001-system-wide-decision.md
└── src/
    ├── ordering/
    │   ├── CONTEXT.md
    │   └── docs/adr/
    └── billing/
        ├── CONTEXT.md
        └── docs/adr/
```

## Use the glossary's vocabulary

When your output names a domain concept, use the term as defined in the relevant context document. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal — either you're inventing language the project doesn't use or there's a real gap worth noting for `/grill-with-docs`.

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding.