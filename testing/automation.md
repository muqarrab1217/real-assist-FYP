Automation Targets (UI/E2E)
===========================

Recommended tool: Playwright or Cypress. Keep suite lean and fast; run against staging or preview build.

Smoke (run per build)
---------------------
- App loads without console errors.
- Login/logout; protected route redirects unauthenticated users to login then back.
- Primary navigation: top-level routes load; 404 renders for unknown route.
- Representative form: happy-path submit, required-field validation, server error handling.
- One shared component path (e.g., table load + filter) succeeds.

Regression (run on release candidate)
-------------------------------------
- Create/edit flow for main entities: happy path + key validations.
- Multi-step wizard: step gating, save/continue, resume after refresh.
- Table CRUD: filter → view → edit → save; pagination and sorting persist.
- File upload: accept valid file, reject wrong type/size.
- Date/time picker: min/max constraint and manual input.
- Modal/drawer focus trap and escape handling.
- Localization/formatting sanity if enabled (date/number/currency on one page).

Accessibility smoke
-------------------
- Axe scan on key pages (home, main form, table).
- Keyboard-only navigation through a form and main menu.

Notes
-----
- Use test IDs where needed for stable selectors.
- Record env, build SHA, browser, viewport for each run.
- Capture screenshots/video on failure; save HAR or network logs for API-related issues.

