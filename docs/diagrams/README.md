# Diagrams

## Phase C — Order spine architecture

| File | How to open |
|------|-------------|
| [`phase-c-order-spine.excalidraw`](./phase-c-order-spine.excalidraw) | Double-click if Excalidraw desktop/VS Code extension is installed; or drag onto [excalidraw.com](https://excalidraw.com) |
| [`phase-c2-my-jobs-pipeline.excalidraw`](./phase-c2-my-jobs-pipeline.excalidraw) | C2 read pipeline (My Jobs → API → mapper → Supabase) |
| Live canvas (if agent session running) | [http://localhost:3000](http://localhost:3000) |

**What it shows (spine):** Today’s quote/book/demo path (left) vs Phase C slices C0–C6 ending in real My Jobs / tracker / notifications (right).

**What it shows (C2 pipeline):** Browser `MyJobsView` → `GET /api/customer/jobs` (session + RLS) → `customer-jobs` / `mapDbOrderToPortal` → `orders` + `order_items`. Fixtures only with `?demo=1`. C3 (book writes) is the next handshake.
