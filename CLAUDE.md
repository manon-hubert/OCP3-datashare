# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Project Overview

Datashare is a file sharing service. Users can upload files and share them via a
generated link.

It is built as a monorepo with three npm workspaces: `backend/`, `frontend/`,
and `e2e/`.

- **Backend**: NestJS 11 (TypeScript, CommonJS). Runs on port 3000 by default.
- **Frontend**: React 19 with Vite 7 (TypeScript, ESM).
- **E2E tests**: Playwright.

## Architecture

- Monorepo with npm workspaces: /backend, /frontend, /e2e
- **Backend**: NestJS with one module per domain (auth, users, files, tags,
  storage)
- **Frontend**: React + Vite + TypeScript, Chakra UI library. Entry point is
  `src/main.tsx`.
- **E2E**: Playwright tests in the `e2e/` workspace.
- All HTTP calls go through frontend/src/api/client.ts — never call fetch
  directly in components
- Storage is abstracted in storage.service.ts — never write to disk outside of
  it
- JWT auth, 15 min expiry, no refresh tokens
- User identity is always derived from the JWT — never trust a userId from
  request params or body

## Key API endpoints (files)

- `POST /files` — upload a file (optional auth, `expiresIn` 1–7 days)
- `GET /files` — list user's files; query params: `filter` (`all` | `active` |
  `expired`), `page`, `limit`
- `GET /files/history` — paginated list of deleted/expired file history (auth
  required); query params: `page`, `limit`
- `DELETE /files/:id` — delete a file (auth + ownership required via
  FileOwnerGuard)
- `GET /files/download/:token` — get file metadata by download token
- `GET /files/download/:token/content` — stream file download by token

## Frontend file listing behavior

- `MyFilesPage` has three tabs: Tous (all), Actifs (active), Expiré (expired)
- The **Expiré** tab fetches from **both** `GET /files?filter=expired` and
  `GET /files/history`, merging live expired files with deleted file history
- The **Tous** tab similarly fetches from both endpoints
- The **Actifs** tab fetches only from `GET /files?filter=active`

## Database

- PostgreSQL with the following tables: user_entity, files, file_history
- tags and file_tags are not yet implemented
- files rows are always live — no soft deletes, deleted rows move to
  file_history
- Anonymous uploads are supported (user_id is nullable on files)
- Tags only exist on live files — file_history has no tag reference
- Anonymous file deletions are NOT recorded in file_history — only authenticated
  user files are tracked

## File lifecycle

- Files expire after 1–7 days (default 7). `expiresAt` is computed at upload
  time from the `expiresIn` parameter
- Expired files still exist in the `files` table until explicitly deleted or
  cleaned up
- On deletion: the file is removed from storage, the row is deleted from
  `files`, and (for authenticated users only) a record is inserted into
  `file_history`

## Error handling

All API errors must follow this format: { "error": { "code": "ERROR_CODE",
"message": "Human readable message" } } Error codes are defined in
backend/src/common/constants/error-codes.ts. Use the global HttpExceptionFilter
— do not return error shapes manually in controllers.

## Security rules

- Passwords (user) are always hashed with bcrypt — never stored plain
- File download passwords are not yet implemented (`FILE_WRONG_PASSWORD` error
  code is reserved for future use)
- download_token is cryptographically random (crypto.randomBytes) — never use
  the file UUID publicly
- Always verify file ownership in DELETE /files/:id using FileOwnerGuard, not in
  the service layer
- MIME types are verified against magic bytes server-side — never trust
  Content-Type from the client
- File size limit is 1 GB — enforced in FileSizePipe before writing to disk

## File storage

- Local disk for now, abstracted behind storage.service.ts
- Path convention: /users/{userId}/{fileId} for authenticated,
  /anonymous/{fileId} for anonymous
- original_name is stored in the DB only — never used in the file path

## Tests

- E2E tests use Playwright in /e2e — run with npm run test:e2e from root
- Backend integration tests use Jest in /backend/test — run with npm run test
  from /backend
- Backend integration tests clean the DB between tests via repository calls in
  afterEach (no shared utility)
- E2E tests do not clean the DB — test isolation relies on unique emails
  generated with Date.now()
- Backend integration tests generate file content as in-memory Buffers — nothing
  written to disk
- Frontend unit tests use Vitest + Testing Library in /frontend — run with npm
  run test from /frontend
- Frontend tests mock the api/\* layer (vi.mock) — never test HTTP directly

### E2E structure

- Tests are in `e2e/tests/` grouped by domain: `auth/` and `files/`
- Page Object Models are in `e2e/pages/` — one file per page
- Each POM keeps all selectors in an `elements {}` object — never write
  selectors directly in methods
- `isDisplayed()` assertions (structural "is this page loaded?") live in POMs;
  scenario-specific assertions (`expect(...)`) stay in test files
- `e2e/fixtures/index.ts` exports a custom `test` with an `authenticatedPage`
  fixture — it registers a fresh user via API, then creates a browser context
  with the token pre-loaded in `localStorage` via `storageState` (not
  `addInitScript`, which would re-inject the token after logout)
- `e2e/helpers/api.ts` exposes `registerUser` and `loginUser` for test setup
  that requires API calls
- `e2e/resources/` holds real files used as upload fixtures (e.g. `cactus.gif`)
- The baseURL is read from `FRONTEND_URL` in the root `.env` file; `API_URL` is
  used by the API helpers

## Code Style

- **Common**: Prettier (single quotes, trailing commas). Shared ESLint base
  config in `eslint.config.base.mjs` (JS recommended, TS recommended +
  stylistic, Prettier conflict resolution, common rules).
- **Backend**: Extends base + `recommendedTypeChecked`. `no-explicit-any` is
  off; `no-floating-promises`, `no-unsafe-argument`, and `require-await` are
  warnings.
- **Frontend**: Extends base + react-hooks and react-refresh plugins.
- **E2E**: Extends base + `recommendedTypeChecked`. `no-floating-promises` is an
  error (missing `await` in Playwright causes flaky tests); `no-console` is off.
