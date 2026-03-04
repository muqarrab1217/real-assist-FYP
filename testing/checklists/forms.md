Forms Test Checklist
====================

Happy Paths
-----------
- Form loads with default values and labels.
- Valid input submits successfully; success state/message shown.
- Data persists after navigation refresh (where applicable).

Validation & Errors
-------------------
- Required fields block submit with clear field-level errors.
- Type/format: email, phone, date, numeric ranges, min/max length, patterns.
- Whitespace-only input rejected where required.
- Special chars and script tags escaped (no XSS).
- File upload: reject invalid type/oversize; accept valid file; show progress.
- Server errors (4xx/5xx) show non-technical message; retry available if expected.

UX & Behavior
-------------
- Submit enabled only when valid; disabled during in-flight request.
- Loading indicators and prevention of duplicate submits.
- Focus order/tab sequence logical; Enter submits when expected.
- Inline validation timing (on blur/on change) works and does not flicker.
- Reset/clear behavior returns defaults.
- Navigation away/back preserves or discards data as designed (draft vs. discard).

Accessibility
-------------
- Inputs have associated labels and aria-describedby for errors/help text.
- Error messages announced and visible; contrast meets guidelines.
- Keyboard-only completion possible; focus visible.

