# Changelog

All notable changes to this project will be documented in this file.

The format is based on "Keep a Changelog" and follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- Created `CHANGELOG.md` to track project changes and build instructions.

### Changed
- Multiple TypeScript and lint fixes across the frontend UI components and pages.
  - Fixed import path issues (replaced `@/...` with relative `../../...` where appropriate).
  - Removed unused `React` imports from components where React was not referenced.
  - Separated variant helpers (e.g., `buttonVariants`, `badgeVariants`) into dedicated files to satisfy fast refresh.
  - Fixed pricing computation and seat lookups in `src/components/booking/BookingSummaryPanel.tsx` (use `slot` seatMap, safe numeric coercion, guard against divide-by-zero).
  - Fixed Storybook stories to use typed `SeatMap` and correct seat `type` literals.
  - Fixed toast/toaster imports and typing for better type-safety.

### Fixed
- Module resolution and type errors across many `src/components/*` files.
- Lint errors from unused imports and incorrect types.

## How to build and run (frontend)

1. Install dependencies

```powershell
npm install
```

2. Start dev server

```powershell
npm run dev
```

3. Run TypeScript checks

```powershell
npx tsc --noEmit
```

4. Run unit tests (Vitest)

```powershell
npm run test
```

5. Run E2E tests (Cypress)

```powershell
npm run cypress:open
```

## How to build and run (backend)

1. Navigate to backend folder

```powershell
cd backend
```

2. Install Python deps (inside a virtualenv)

```powershell
python -m venv .venv; .\.venv\Scripts\Activate.ps1; pip install -r requirements.txt
```

3. Initialize DB

```powershell
python init_db.py
```

4. Run Django server

```powershell
python manage.py runserver
```

## Notes
- If you use a monorepo-aware path alias setup (like `@/`), make sure your editor and build tooling (Vite/tsconfig) resolve aliases consistently; some files were using `@/lib/utils` which caused resolution errors in this workspace, so they were changed to relative imports.
- If you'd like, I can also add a `RELEASE.md` or automate changelog generation from commit messages.
