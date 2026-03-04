Frontend Test Coverage Plan
===========================

Purpose
-------
Document the coverage and execution plan for already-implemented frontend modules, with emphasis on input forms, navigation flows, and shared components.

Scope & Environments
--------------------
- Targets: All delivered pages/modules in the app (forms, navigation shell, shared components).
- Environments: dev or stage build + prod-like preview. Browsers: Chrome (baseline) plus one of Firefox/Safari/Edge. Viewports: desktop and a key mobile breakpoint.
- Data: Stable test accounts/fixtures; document feature-flag states used.

Execution Mix
-------------
- Automated UI smoke/regression (Playwright/Cypress suggested) for critical flows.
- Manual exploratory for new/changed areas, UX polish, and edge cases.
- Accessibility sweep (axe, keyboard-only) on representative pages.

Test Suites
-----------
- Smoke: load app, login/protected route redirect, primary navigation, one happy-path form submit, 404 handling.
- Regression: all form types (create/edit), multi-step flows, navigation menus, tables/lists, upload widgets, modals/drawers, toasts, date/time pickers.
- Exploratory: stress (slow network, rapid clicks), offline/retry, error paths (4xx/5xx), responsive behavior.

Artifacts
---------
- Checklists in `checklists/` for quick runs.
- Automation targets in `automation.md`.
- Report defects with env/build, browser, viewport, data used, steps, expected vs. actual, console/network evidence.

Cadence
-------
- Per build: automated smoke + 10–15 item manual sanity.
- Per release candidate: full regression set.
- After fixes: targeted retest of the affected flow plus smoke.

How to Use
----------
1) Pick the env and browser set for the run. Note feature flags and data.
2) Run smoke first. If clean, proceed to regression relevant to the release scope.
3) Capture evidence (screenshots, console logs, HAR) for any failure.
4) Record results in your tracker referencing the checklist item ID.

