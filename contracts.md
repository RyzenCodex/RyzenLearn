Psychology Study Hub – API Contracts (v1)

Purpose
- Replace frontend mocks (src/mock.js) with real Mongo-backed data and user state persistence.
- Anonymous usage: clientId stored in browser localStorage, sent with every call.

Key Data (Mocked in src/mock.js to be replaced)
- Branch catalog (slug, name, level, summary, heroImage, keyIdeas, psychologists, mnemonics, activities, resources, quiz[], schedule[])
- User-local state: bookmarks per branch, study tasks per branch (including custom tasks), quiz best score per branch, optional notes.

Collections
- branches: static catalog (seeded on server start if empty)
- client_states: one document per clientId, shape:
  {
    client_id: string,
    bookmarks: { [slug]: boolean },
    tasks: { [slug]: [{ text: string, done: boolean }] },
    quiz: { [slug]: { best: number } },
    notes?: string,
    created_at, updated_at
  }
- quiz_attempts (optional; not required for v1)

API Endpoints (all prefixed with /api)
- GET /api/branches → 200 [{...branch}]
- GET /api/branches/{slug} → 200 {...branch} | 404

- GET /api/state/{clientId} → 200 client_state (auto-creates empty if missing)

- GET /api/state/{clientId}/tasks/{slug} → 200 [{ text, done }] (defaults to branch.schedule if empty)
- PUT /api/state/{clientId}/tasks/{slug} body: { tasks: [{ text, done }] } → 200 { ok: true }

- PUT /api/state/{clientId}/bookmarks/{slug} body: { bookmarked: boolean } → 200 { slug, bookmarked }

- GET /api/state/{clientId}/quiz → 200 { [slug]: { best: number } }
- PUT /api/state/{clientId}/quiz/{slug} body: { best: number } → 200 { slug, best }

- GET /api/state/{clientId}/notes → 200 { notes: string }
- PUT /api/state/{clientId}/notes body: { notes: string } → 200 { ok: true }

Validation
- All slugs must exist in branches. PUT endpoints validate payloads.

Frontend Integration Plan
1) Generate clientId once in browser localStorage (e.g., psych_client_id = uuid).
2) Replace src/mock.js usage with API:
   - Fetch branches from GET /api/branches
   - For active branch:
     • GET tasks; PUT after any change or add
     • PUT bookmark toggle; read bookmark status from GET state
     • GET quiz progress; PUT best score after quiz finish
   - Resources, key ideas, mnemonics come from branch payload
3) Keep optimistic UI with toasts; fall back to local temporary state on transient errors.

What will be implemented now (backend)
- Branch seeding (idempotent)
- Endpoints listed above with Mongo persistence
- CORS already enabled

What remains for later (nice-to-have)
- Auth, rate limiting, server-side analytics, pagination/search for branches, quiz attempts history