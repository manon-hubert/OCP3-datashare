# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Datashare is a file sharing service. Users can upload files and share them via a generated link.

It is built as a monorepo with three npm workspaces: `backend/`, `frontend/`, and `e2e/`.

- **Backend**: NestJS 11 (TypeScript, CommonJS). Runs on port 3000 by default.
- **Frontend**: React 19 with Vite 7 (TypeScript, ESM).
- **E2E tests**: Playwright.

## Architecture

- Monorepo with npm workspaces: /backend, /frontend, /e2e
- **Backend**: NestJS with one module per domain (auth, users, files, tags, storage)
- **Frontend**: React + Vite + TypeScript, Chakra UI library. Entry point is `src/main.tsx`.
- **E2E**: Playwright tests in the `e2e/` workspace.
- All HTTP calls go through frontend/src/api/client.ts — never call fetch directly in components
- Storage is abstracted in storage.service.ts — never write to disk outside of it
- JWT auth, 15 min expiry, no refresh tokens
- User identity is always derived from the JWT — never trust a userId from request params or body

## Database

- PostgreSQL with the following tables: users, files, file_tags, tags, file_history
- files rows are always live — no soft deletes, deleted rows move to file_history
- Anonymous uploads are supported (user_id is nullable on files)
- Tags only exist on live files — file_history has no tag reference

## MVP scope (build only these)

- Register, login (JWT)
- Upload file (authenticated only, no password, no tags, no custom expiry)
- List own files (paginated)
- Delete file
- Download file by token

## Deferred (do not build yet)

- Anonymous uploads
- Tags
- Password-protected downloads
- File expiration cron job
- File history endpoint

## Error handling

All API errors must follow this format:
{
"error": {
"code": "ERROR_CODE",
"message": "Human readable message"
}
}
Error codes are defined in backend/src/common/constants/error-codes.ts.
Use the global HttpExceptionFilter — do not return error shapes manually in controllers.

## Security rules

- Passwords (user + file download) are always hashed with bcrypt — never stored plain
- download_token is cryptographically random (crypto.randomBytes) — never use the file UUID publicly
- Always verify file ownership in DELETE /files/:id using FileOwnerGuard, not in the service layer
- MIME types are verified against magic bytes server-side — never trust Content-Type from the client
- File size limit is 1 GB — enforced in FileSizePipe before writing to disk

## File storage

- Local disk for now, abstracted behind storage.service.ts
- Path convention: /users/{userId}/{fileId} for authenticated, /anonymous/{fileId} for anonymous
- original_name is stored in the DB only — never used in the file path

## Tests

- E2E tests use Playwright in /e2e — run with npm run test:e2e from root
- Backend unit/integration tests use Jest in /backend/test
- E2E tests set up preconditions via API calls (utils/api.ts), not through the UI
- DB is cleaned between test suites via utils/db.ts
- Do not commit large test files — large-file.bin is generated at runtime

## Code Style

- **Common**: Prettier (single quotes, trailing commas). Shared ESLint base config in `eslint.config.base.mjs` (JS recommended, TS recommended + stylistic, Prettier conflict resolution, common rules).
- **Backend**: Extends base + `recommendedTypeChecked`. `no-explicit-any` is off; `no-floating-promises`, `no-unsafe-argument`, and `require-await` are warnings.
- **Frontend**: Extends base + react-hooks and react-refresh plugins.
- **E2E**: Extends base + `recommendedTypeChecked`. `no-floating-promises` is an error (missing `await` in Playwright causes flaky tests); `no-console` is off.
