Navigation & Routing Checklist
==============================

Core Navigation
---------------
- Main menu items navigate to correct routes; active state highlights current page.
- Deep links load expected content.
- Protected routes redirect unauthenticated users to login; return after login.
- 404/500 routes render friendly pages with recovery links.

History & State
---------------
- Browser back/forward maintains state where expected (filters, form drafts).
- Query params preserved across navigation where required.
- Modals/drawers: open/close restores focus; back button handling correct.

Responsive & Interaction
------------------------
- Navigation collapses/expands correctly at breakpoints; overflow menus accessible.
- Keyboard navigation through menu items works; focus visible.
- External links open as intended with proper rel attributes.

