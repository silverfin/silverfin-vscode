# Snippet authoring guidelines

Conventions for the Liquid snippet JSON files in this folder.

## Prefer atomic, composable snippets

Model a tag as one base snippet plus small, single-purpose attribute snippets
the user composes — not one composite snippet per variant. Only bundle
attributes that are **required together** under a single prefix. Verify a tag's
real syntax against the Silverfin docs before adding snippets; don't invent
attributes or type selectors.

```jsonc
// ✅ base tag + atomic attributes the user mixes and matches
"input_validation":     { "prefix": "input_validation", "body": "{% input_validation \"${1:name}\" %}" },
"input_validation min": { "prefix": "min", "body": "min:${1:value}" },
"input_validation max": { "prefix": "max", "body": "max:${1:value}" },

// ❌ one composite snippet per variant
"input_validation numeric": { "prefix": "input_validation numeric", "body": "{% input_validation \"${1:name}\" min:${2:x} max:${3:y} %}" }
```

Bundle only attributes that are required together — e.g. a regex `pattern`
always needs a `validation_text`:

```jsonc
"input_validation pattern": { "prefix": "pattern", "body": "pattern:\"${1:^regex$}\" validation_text:\"${2:message}\"" }
```

## Key vs. prefix

The snippet **key** is only a display name; the **`prefix`** is what the user
types. Give related snippets a shared key prefix so they group together in the
picker, but keep the trigger bare. Start each snippet's tabstops at `${1}`.

```jsonc
//  key — groups in the picker      prefix — what you type
"input_validation min": { "prefix": "min", "body": "min:${1:value}" }
"input_validation max": { "prefix": "max", "body": "max:${1:value}" }
```

## Keep prefixes shallow — only a free variable earns an extra level

Default to a keyword plus its direct options (`keyword.{options}`). Don't chain
to a deeper level — **unless** the next segment is a free variable.

A free variable (e.g. `[account_number]`) is the one thing that earns an extra
level: the user types a real value into it, and autocomplete can't re-fire at a
filled-in variable, so that variable's options have to be bundled into the same
snippet. A fixed keyword doesn't need this — it triggers completion on its own,
so it becomes its **own** snippet instead of being chained onto the path.

```jsonc
// normal, shallow shape — a keyword and its direct options
"prefix": "accounts.",
"body":   "accounts.${1|assets,liabilities,count,first,name|}"

// ✅ one level deeper — allowed because [account_number] is a free variable
"prefix": "accounts.[account_number].",
"body":   "accounts.[${1:account_number}].${2|value,name,number,transactions|}"

// ❌ transactions is a keyword, not a free variable — don't chain it onto the path
"prefix": "accounts.[account_number].transactions."

// ✅ instead give the keyword its own snippet (which may use the free-variable exception itself)
"prefix": "transactions.",
"body":   "transactions.[${1:some_transaction}].${2|value,date,relation,account|}"
```

The test for "may I go deeper?" is simply: **is the next segment a free
variable?** If yes, bundle its options (it can't self-complete). If it's a fixed
keyword, stop and give it its own snippet.

## Keep prefix collisions intentional

The same `prefix` may appear in several snippets (the editor shows them all).
When it does, disambiguate through the key name and avoid needless overlap
between families.

```jsonc
// same trigger "min" in two families — distinct keys keep them readable
"input_validation min": { "prefix": "min", "body": "min:${1:value}" }  // validation attribute
"MIN function":         { "prefix": "MIN", "body": "MIN(${1:value})" }  // filter — uppercase, no lowercase alias
```
