# Invoice App

A fully responsive React invoice manager. Create, view, edit, delete, draft, and mark invoices as paid. Filter by status, switch theme, and persist everything in the browser.

Built for the HNG Frontend Task 2.

## Setup

Requirements: Node 18+ and npm.

```bash
npm install
npm run dev      # start dev server (Vite)
npm run build    # production build to ./dist
npm run preview  # preview the production build
npm run lint     # ESLint
```

The app runs by default on http://localhost:5173.

## Tech

- React 19 (function components + hooks, no class components)
- React Router 7
- Vite 8
- Plain CSS (custom properties, media queries)
- LocalStorage for persistence

## Architecture

```
src/
  main.jsx                  app bootstrap, sets initial theme attribute
  App.jsx                   <BrowserRouter> with two routes
  pages/
    invoicePage.jsx         list + filter + new-invoice form
    invoiceDetailsPage.jsx  view, edit, delete, mark-as-paid
  components/
    header.jsx              brand + theme toggle
    invoiceCard.jsx         single row in the list
    emptyMessage.jsx        empty state (no invoices vs filtered empty)
    status.jsx              colored status badge (Draft/Pending/Paid)
    form.jsx                create + edit form, validation, draft/send
    invoiceActions.jsx      footer action group
    modal.jsx               accessible dialog (focus trap, ESC, scroll lock)
data.js                     LocalStorage CRUD helpers + ID generator
src/index.css               global styles, themes, responsive layout
```

### Data flow

`data.js` is the single source of truth. It owns the LocalStorage key `invoices`, exports `getInvoices`, `addInvoice`, `updateInvoice`, `deleteInvoice`, and `generateInvoiceId`. Pages call these helpers directly and re-read after each mutation. There is no global state library; React state in the page components is enough for an app of this size.

### Status logic

An invoice has one of three statuses:

| Action            | Resulting status |
| ----------------- | ---------------- |
| Save as Draft     | draft            |
| Save & Send (new) | pending          |
| Mark as Paid      | paid             |

A paid invoice cannot be edited or marked back to anything else (Edit and Mark as Paid buttons are disabled). A draft can be edited and resaved as either a draft or sent (becomes pending).

### Form validation

Validation runs only on **Save & Send**. Save as Draft persists whatever has been entered so users can resume later.

Send-time rules:

- All Bill From and Bill To address fields are required
- Client email must match name@host.tld
- Invoice date and project description are required
- At least one item is required
- Each item must have a name, a quantity > 0 and a non-negative price

Errors render inline next to the corresponding label and visually mark the input via `aria-invalid` plus a red border. The form sets `noValidate` so the browser does not compete with our messages.

## Theming

`src/main.jsx` reads `localStorage.theme` (or `prefers-color-scheme` as fallback) and writes `data-theme="light|dark"` on `<html>` *before* React mounts, which prevents a flash of incorrect theme. The header toggle updates the same attribute and persists the choice.

All colors are CSS custom properties scoped on `:root` / `[data-theme="dark"]`, so adding new themes is a one-block change.

## Accessibility

- Semantic HTML: `<header>`, `<main>`, `<footer>`, `<article>`, `<address>`, `<table>` for line items, `<button>` for all actions (no clickable `<div>`s), single `<h1>` per page
- Every form control has a real `<label htmlFor>` association
- Errors use `aria-invalid` + `aria-describedby`
- The delete confirmation is a true modal: `role="dialog"`, `aria-modal`, focus trap (Tab/Shift+Tab cycles inside), Escape closes, body scroll is locked, focus returns to the invoking button on close
- `*:focus-visible` shows a 2px accent outline everywhere
- Hover states for buttons, cards, filter options, links, inputs
- `prefers-reduced-motion` disables transitions
- Color tokens chosen for WCAG AA contrast in both themes; status badges keep their colored text on tinted backgrounds

## Responsiveness

Mobile-first. Breakpoints at `48rem` (768px) and `64rem` (1024px).

- Mobile: stacked card layout, full-width buttons, table rows fold
- Tablet: cards become single-row grid, content centered at 730px, form gets a card surface
- Desktop: detail-page actions move into the status bar, footer bar hides, form actions split (Cancel left / Draft + Send right)

`html, body { overflow-x: hidden }` plus grid/flex with min sizing prevents any horizontal scrollbars.

## Trade-offs

- **LocalStorage over IndexedDB / a backend.** The data shape is small and fits comfortably in LocalStorage (<= 5 MB). IndexedDB would add async ceremony with no real benefit at this scale. Swapping it out later only touches `data.js`.
- **No state library.** Each page re-reads from `data.js` after a mutation. Avoids prop drilling and external deps; the only duplication is the re-read call.
- **No TypeScript.** The task is ESM React + Vite. TS would be a net win for a real codebase but is outside the scope here.
- **Inline form helpers.** `validateForSend` lives in `form.jsx` rather than a `utils/` module because it is only used there.

## Improvements beyond the requirements

- Focus trap, scroll lock and focus restoration on the modal
- `prefers-reduced-motion` support
- Pre-mount theme attribute (no FOUC)
- Distinct empty states for "no invoices" vs "filtered out everything"
- Live region announces invoice count when the filter changes
- Item line items rendered as a real `<table>` with a visually hidden `<thead>` for screen readers
