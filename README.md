# Acme CMS — Headless CMS + Public Website

A production-style Content Management System: an Express/MongoDB backend that
serves content over a REST API, an admin panel (Next.js + Redux Toolkit) for
managing that content, and a public-facing site that renders whatever the
admin publishes. No content on the public site is hardcoded — every section
of every page is fetched from the API.

> **Assumption:** No Figma file was reachable when this was built, so the
> public site's structure (Home page with hero/features/team sections, and a
> Documentation page) is a reasonable stand-in intended to exercise every
> required content type (long-form text, multi-paragraph copy, lists, nested
> lists, tables, equations, and structured/mixed documentation). Swapping in
> the real design would mean changing Tailwind classes in
> `frontend/src/components` and `frontend/src/app/**/page.js` — the content
> model and admin panel underneath do not need to change.

---

## 1. Quick start (Docker)

```bash
git clone <this-repo-url> acme-cms
cd acme-cms

cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

docker compose up --build

# in a second terminal, once the backend container is healthy:
docker compose exec backend npm run seed
```

- Public site: http://localhost:3000
- Docs page: http://localhost:3000/docs
- Admin panel: http://localhost:3000/admin/login
- API: http://localhost:5000/api/health

**Seed admin credentials** (created by `npm run seed`, configurable via
`backend/.env`):

```
email:    admin@example.com
password: Admin@12345
```

## 2. Running without Docker (local dev)

Requires Node 20+ and a local/remote MongoDB instance.

```bash
# Backend
cd backend
cp .env.example .env        # edit MONGO_URI if not using local mongo
npm install
npm run seed                # creates admin user + sample "home"/"docs" pages
npm run dev                 # http://localhost:5000

# Frontend (new terminal)
cd frontend
cp .env.example .env.local
npm install
npm run dev                 # http://localhost:3000
```

---

## 3. Technology choices

| Layer          | Choice                                | Why                                                                                   |
|----------------|----------------------------------------|----------------------------------------------------------------------------------------|
| Backend        | Express.js                            | Requested stack; minimal, explicit routing/middleware, easy to reason about.           |
| Database       | MongoDB + Mongoose                    | Content is tree-shaped and schema-flexible (see §4) — a document DB is a natural fit vs. modeling variable block shapes across relational tables. |
| Auth           | JWT access token (in-memory/Redux) + httpOnly refresh cookie | Access token never touches localStorage (XSS-safer); refresh cookie survives reloads without re-login. |
| Frontend/Admin | Next.js (App Router)                  | Requested stack; lets the *same* app serve statically-friendly public pages (Server Components + ISR) and a fully client-side admin SPA. |
| State mgmt     | Redux Toolkit + RTK Query             | Requested; used specifically where it earns its keep (see §5).                        |
| Styling        | Tailwind CSS                          | Fast to build a clean, responsive admin UI without hand-rolled CSS.                    |
| Equations      | KaTeX                                  | Renders LaTeX client-side, no server dependency, fast.                                 |
| Infra          | Docker Compose (mongo + backend + frontend) | One command to stand the whole stack up for evaluation.                        |

---

## 4. Architecture overview

```
┌─────────────┐        REST/JSON        ┌──────────────┐        ┌─────────┐
│  Public site │ ───────────────────────▶│              │        │         │
│ (Next.js SSR)│◀───── published pages ──│  Express API │◀──────▶│ MongoDB │
└─────────────┘                          │              │        │         │
┌─────────────┐   JWT + RTK Query        │  /api/auth   │        └─────────┘
│ Admin panel  │ ───────────────────────▶│  /api/content│
│ (Next.js SPA)│◀── drafts + published ──│              │
└─────────────┘                          └──────────────┘
```

### 4.1 Content model — block-based, not fixed fields

Instead of a `Page` with fixed `title`/`body` string fields, content is
modeled as a tree:

```
Page
 └─ sections[]        (ordered named groups, e.g. "hero", "features")
     └─ blocks[]       (ordered, typed)
         ├─ type: heading | paragraph | list | table | equation
         │         | image | quote | callout | divider
         ├─ data: { ...shape depends on type }
         └─ children[]  (same Block shape — used for nested lists today,
                          but the recursion means any block can contain
                          other blocks in the future, e.g. a callout that
                          wraps a table)
```

This is the same idea behind Notion's blocks / Sanity's Portable Text, and
it's the key decision that satisfies the "rich content support" requirement:

- **Long-form text / multiple paragraphs** → multiple `paragraph` blocks.
- **Lists / nested lists** → `list` blocks; nesting via `children`.
- **Tables** → `table` blocks with `headers`/`rows`.
- **Mathematical equations** → `equation` blocks, rendered with KaTeX.
- **Structured documentation** → any mix of the above, ordered within a
  section (see the seeded `/docs` page).
- **Mixed content** → sections simply hold an ordered array of
  heterogeneous block types.

New block types can be added by (a) adding a case to the Mongoose `enum`,
(b) adding a default shape in `frontend/src/lib/blocks.js`, (c) adding a
render case in `frontend/src/components/BlockRenderer.jsx`, and (d) adding
an edit case in `frontend/src/components/admin/BlockEditorRow.jsx` — no
migration of existing content required, since `data` is intentionally
`Mixed` at the DB layer and shape-validated at the application layer
instead.

**Persistence strategy for edits:** the editor sends the *entire* `sections`
tree on save (`PUT /api/content/admin/pages/:id`) rather than issuing
granular per-block patch requests. For a CMS of this scope (a handful of
pages, edited by a small admin team, not concurrent multi-cursor editing),
this is simpler and more robust than reconciling partial tree patches, at
the cost of last-write-wins semantics if two admins edit the same page at
the same time. A production system with concurrent editors would want
either optimistic locking (`updatedAt`/version check on save) or a
real-time CRDT-based editor — noted here as a deliberate scope trade-off.

### 4.2 Auth

- `POST /api/auth/login` verifies credentials, returns a short-lived JWT
  **access token** in the response body and sets a long-lived **refresh
  token** as an `httpOnly` cookie.
- The access token is kept in Redux state only (never persisted to
  `localStorage`), which limits exposure to XSS.
- On a hard page reload the access token is gone from memory, so the admin
  layout silently calls `POST /api/auth/refresh` (using the httpOnly
  cookie) to mint a new access token before deciding whether to redirect
  to `/admin/login`.
- `requireAuth`/`requireRole` middleware protect all `/api/content/admin/*`
  routes; deleting a page additionally requires the `admin` role (an
  `editor` role exists for future least-privilege use cases).

### 4.3 Public vs. admin rendering strategy

- **Public pages** (`frontend/src/app/page.js`, `frontend/src/app/docs/page.js`)
  are React **Server Components** that `fetch()` published content directly
  from the API at request time, with Next's ISR (`revalidate: 30`) caching
  the result for 30 seconds. There's no client-side state here — it's a
  one-shot read with no interactivity, so routing it through Redux would
  add indirection with no benefit.
- **Admin panel** (`frontend/src/app/admin/**`) is client-rendered and uses
  Redux Toolkit + RTK Query, because it genuinely needs global,
  auth-aware, cache-invalidating state: the access token must be visible
  to every admin screen, and edits to a page need to invalidate the pages
  list cache, support optimistic UI, etc. RTK Query's `tagTypes` (`Page`)
  handle cache invalidation across the pages list and the editor.
- **In-progress edits inside a single page editor** are kept in **local
  component state** (`useState` in `frontend/src/app/admin/content/[id]/page.js`),
  not Redux — they're only relevant to that one screen, don't need to
  survive navigation, and putting every keystroke into the global store
  would be unnecessary overhead. This is the concrete answer to "how much
  state belongs in Redux vs. local state": *server-derived, cross-screen,
  or auth state → Redux/RTK Query; transient form/editing state → local.*

---

## 5. API summary

| Method | Path                              | Auth        | Purpose                              |
|--------|------------------------------------|-------------|----------------------------------------|
| POST   | `/api/auth/login`                 | —           | Login, returns access token + sets refresh cookie |
| POST   | `/api/auth/refresh`               | cookie      | Mint a new access token                |
| POST   | `/api/auth/logout`                | —           | Clears refresh cookie                  |
| GET    | `/api/auth/me`                    | Bearer      | Current user                           |
| GET    | `/api/content/public/pages`       | —           | List published pages                   |
| GET    | `/api/content/public/pages/:slug` | —           | Get one published page                 |
| GET    | `/api/content/admin/pages`        | Bearer      | List all pages (draft + published)     |
| GET    | `/api/content/admin/pages/:id`    | Bearer      | Get one page (any status)               |
| POST   | `/api/content/admin/pages`        | Bearer      | Create a page                            |
| PUT    | `/api/content/admin/pages/:id`    | Bearer      | Update title/slug/status/sections       |
| DELETE | `/api/content/admin/pages/:id`    | Bearer(admin)| Delete a page                          |

---

## 6. Assumptions & scope decisions

- No real Figma design was accessible, so the public site layout is a
  reasonable generic stand-in (see note at the top of this file).
- Image blocks store a plain URL (`data.src`); there's no file-upload/
  object-storage pipeline implemented, since the assignment's rich-content
  list is about content *types*, and adding S3/Cloudinary uploads would be
  a straightforward but orthogonal addition (`multer` + object storage +
  a new `/api/media` route) rather than a CMS-architecture decision.
- Nested containment is implemented one level deep in the admin UI (nested
  lists inside a list block) even though the data model supports arbitrary
  recursion — deeper UI nesting (e.g. an editor for a callout that itself
  contains a table) is a straightforward extension of the same
  `BlockEditorRow` recursion, trimmed here for scope.
- Full-tree save (§4.1) is chosen over granular per-block PATCH endpoints;
  documented as a trade-off, not an oversight.
- Two roles (`admin`, `editor`) exist in the data model; the UI does not
  yet gate specific screens by role beyond delete-page, since the
  assignment only requires login/logout at minimum.
- Rate limiting is applied to `/api/auth/login` (20 attempts / 15 min) as a
  baseline production safeguard; no broader WAF/abuse-prevention layer is
  in scope.

---

## 7. Project structure

```
backend/
  src/
    config/db.js            # Mongo connection
    models/User.js           # Admin/editor users
    models/Page.js            # Block-based content model (see §4.1)
    middleware/auth.js        # JWT verification + role guard
    controllers/, routes/     # auth + content (public/admin split)
    seed/seed.js               # creates admin user + sample "home"/"docs" pages
frontend/
  src/
    app/
      page.js, docs/page.js    # public site (Server Components, no Redux)
      admin/
        layout.js               # auth guard + shell (silent refresh on reload)
        login/, dashboard/, content/, content/[id]/
    components/
      BlockRenderer.jsx         # renders any block tree (shared by public + admin preview)
      admin/                    # Sidebar, SectionEditor, BlockEditorRow
    store/
      store.js, features/authSlice.js, features/apiSlice.js  # Redux Toolkit + RTK Query
    lib/
      content.js                # server-side fetch helper for public pages
      blocks.js                 # block factory/defaults used by the editor
docker-compose.yml
```

---

## 8. Environment variables

See `backend/.env.example` and `frontend/.env.example` for the full,
copy-pasteable templates referenced above.
