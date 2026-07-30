# Agent entrypoint

This repository’s **source of truth for engineering standards** is the **`vault/`** folder.

Read **[CLAUDE.md](./CLAUDE.md)** for the full table of contents and mandatory self-documentation rules.

| Vault file | Use |
|------------|-----|
| `vault/decisions.md` | **Locked decisions** — branch policy (`main`=marketing, `develop`=product). Read first for PR target. |
| `vault/architecture.md` | Stack, layout, surfaces |
| `vault/security.md` | Auth, RLS, secrets, data rules |
| `vault/components.md` | Reuse catalog — check before new UI |
| `vault/branding_and_design.md` | Tokens, brand, motion |

**App code:** `my-app/`  
**Planning docs:** `docs/`

**PRs:** always → **`develop`** until `vault/decisions.md` D-BRANCH is updated by the owner.
