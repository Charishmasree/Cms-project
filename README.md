# Dynamic CMS Platform (Production-Ready Content Management System)

A production-ready Content Management System (CMS) featuring a modern admin portal, comprehensive page builder, mathematical rendering engine, tabular data matrix creator, and rich Markdown-ready document nodes. The entire application is decoupled and powered by a custom **Express.js full-stack server** and a **React Single Page Application (SPA)** with **Redux Toolkit** state coordination.

## 🚀 Key Features

- **Decoupled Architecture**: Real-time synchronization of the public-facing application based on database configurations fetched from the Express REST API.
- **Unified Authentication**: Security checkpoints for administrators with login, logout, and automatic session restoration.
- **Multi-Paragraph Rich Text**: Native Markdown formatting parser supporting complex documentation hierarchies, inline codes, block quotes, and clean visual containers.
- **Dynamic Data Matrix Tables**: Reactive table constructor enabling administrators to add/remove columns, insert rows, edit headers, and update cells directly.
- **Scientific Equation Renderer**: Algebraic formatting deck displaying LaTeX equations dynamically in highly legible cards with dedicated typography.
- **Interactive Documentation Explorer**: Dynamic sidebars grouping articles by categories, providing manual search and index capabilities.
- **Advanced State Coordination**: Comprehensive Redux Toolkit implementation handling loaded schemas, editing draft states, loading/error flags, and sessions.

---

## 🛠️ Technology Choices & Architectural Decisions

1. **Frontend: React + Redux Toolkit + Tailwind CSS**
   - **Vite & React**: Chosen for exceptionally fast build performance and robust component rendering.
   - **Redux Toolkit**: Centralized state controller manages all dynamic pages, section hierarchies, authentications, active loaders, and UI layout states. Local state is reserved only for local inputs (like active login fields) to maintain standard state hygiene.
   - **Tailwind CSS v4**: Applied for zero-runtime utility styling, ensuring the layout is lightweight and fully responsive on desktops, tablets, and phones.
   
2. **Backend: Express.js + JSON DB File Persistence**
   - **Express Server**: Handles routing, serving static outputs in production, and hosting secure API endpoints.
   - **File-Based Database (`content_db.json`)**: Selected for high portability, ease of setup, and zero cloud service overhead during evaluations. It automatically persists layout structures to disk between node restarts.
   - **Seed Engine**: Bootstraps preconfigured rich templates containing formulas, matrices, lists, and docs.

3. **Production Bundler: Esbuild + tsx**
   - We utilize `tsx` to run TypeScript files directly in development.
   - For production, `esbuild` compiles `server.ts` into a unified CommonJS chunk (`dist/server.cjs`), solving any strict ES Modules path loading restrictions.

---

## 🔑 Administrative Evaluation Credentials

Use the following credentials in the login workspace:

- **Username**: `admin`
- **Password**: `password123`

---

## 🏗️ Getting Started & Setup Instructions

Ensure you have [Node.js](https://nodejs.org) (v18 or higher) installed on your system.

### 1. Install Dependencies
Run the install command to populate necessary node modules:
```bash
npm install
```

### 2. Run the Application in Development Mode
Start the full-stack server and watch for asset changes:
```bash
npm run dev
```
The server will boot on **port 3000** (`http://localhost:3000`).

### 3. Build and Start the Production Release
Compile the assets and launch the production cluster:
```bash
# Build the Vite SPA and bundle the Express server with esbuild
npm run build

# Start the standalone server
npm run start
```

---

## 🛰️ REST API Endpoints Reference

All modification requests (PUT/POST/DELETE) require the `Authorization` header with the bearer session token: `Bearer cms-session-admin-token-2026`.

| Endpoint | Method | Authentication | Description |
| :--- | :---: | :---: | :--- |
| `/api/content` | `GET` | No | Retrieves all pages and their sorted sections |
| `/api/content/:slug` | `GET` | No | Retrieves a single page and sections by slug |
| `/api/content` | `PUT` | **Admin Required** | Dispatches full system page structure updates |
| `/api/content/reset` | `POST` | **Admin Required** | Reverts database to default seed templates |
| `/api/auth/login` | `POST` | No | Grants token given valid username and password |
| `/api/auth/logout` | `POST` | No | Discards active token session |
| `/api/auth/session` | `GET` | No | Validates current header token status |

---

## 📝 Assumptions & Considerations

- **Single Container Target**: Built explicitly to run behind standard reverse proxy environments (like Cloud Run or Nginx) routing directly to port `3000`.
- **Preconfigured Environment**: Database files initialize automatically with seed layouts upon first startup.
- **Port Bounding**: Hardcoded to bind to `PORT=3000` on `0.0.0.0` as requested by platform rules.
- **Local Storage Sessions**: Admin tokens are cached locally in the browser to maintain authentication across hot reloads.
