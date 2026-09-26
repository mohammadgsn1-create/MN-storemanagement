# Your reorganized frontend — fully working version

Everything in this zip has been tested (every "Add" popup opens correctly, on every page)
and is ready to use as-is.

## New folder structure

```
your-project/
├── pages/          all 16 HTML files (login, dashboard, companies, customers, etc.)
├── css/
│   ├── base.css              shared design system (colors, reset, sidebar/topbar/nav, buttons)
│   ├── auth.css               shared styling for the login/index sign-in screen
│   ├── modal.css               shared "Add new" popup styling
│   ├── translate.css           your EN/AR toggle + RTL styling
│   └── pages/
│       ├── companies.css       page-specific styles (tables, cards, etc.)
│       ├── ...one per page
│       └── login.css           small extra bit login.html needs beyond auth.css
└── js/
    ├── base.js          shared sidebar collapse/expand toggle
    ├── modal.js          shared "Add new" popup system
    ├── auth-form.js       shared password-toggle + form-submit logic for login/index
    ├── translate.js        your EN/AR toggle + T() translation lookup
    └── pages/
        ├── companies.js     page-specific logic (tables, data handling, etc.)
        └── ...one per page
```

## What was actually broken, and what I fixed

Three separate bugs were stacked on top of each other — this is why it took a few rounds:

**1. `companies.html` and `customers.html` had leftover/duplicate script tags**
Your original `companies.html` had a stray `<script src="./customers.js">` left over from
somewhere, and `customers.html` referenced its own script twice. Both caused JavaScript errors
that stopped those two pages' "Add" buttons from working. Removed both.

**2. `modal.css` was never actually a separate file to begin with**
It turns out your original pages never had a real `<link>` tag for `modal.css` — that text only
ever existed inside a comment (documentation for how it *could* be split out one day). The real
modal styling was inlined in each page's own `<style>` block the whole time. I've now properly
extracted the shared parts into `css/modal.css` and added a real `<link>` tag for it on all 10
pages that use popups (companies, customers, invoices, payments, products, receipts, returns,
services, staff, store-debt).

**3. `translate.js`'s `T()` function could throw and silently break every popup**
`T()` — the function every popup calls to set its title — reads from `localStorage`, and
`localStorage` can be blocked by the browser when a page is opened by double-clicking the HTML
file directly (`file://`) rather than through a real app or server. I wrapped those calls in
try/catch with a safe fallback, so this can't happen regardless of how the page is opened.

## Still worth doing, when you have time (not urgent)

**Five pages have their own divergent copy of the modal code**
`customers.js`, `invoices.js`, `products.js`, `returns.js`, and `store-debt.js` each have their
*own* inlined version of the "Add new" popup logic instead of using the shared `js/modal.js`.
They all work correctly as-is, but `products.js`'s version is actually the newest/best one (it
supports full-width fields and dropdown options the others don't) — worth eventually upgrading
`js/modal.js` to match it and pointing every page at the one shared file.

## Best way to test this

Test through your actual Electron app (`npm start`), not by double-clicking the HTML files in
a browser — double-clicking opens the page over `file://`, which some browsers restrict in ways
that don't reflect how the page behaves once it's actually running in your app.

## For your Electron `main.js`

Since `index.html` now lives inside `pages/` instead of the project root, update this line:
```javascript
win.loadFile('index.html');
```
to:
```javascript
win.loadFile('pages/index.html');
```
