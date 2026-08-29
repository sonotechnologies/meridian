# Meridian Bank – Demo Banking App (Next.js)

A **fictional, clearly-labeled demo** banking web app in English. Original
branding — not a copy of any real bank's identity. Built for practicing
Next.js (App Router) auth flows and dashboard UI/UX.

## Pages

- **`/signup`** — real client-side sign-up: full name, email, phone,
  password with a strength meter, live validation, and terms
  acknowledgment. Creates an account stored in `localStorage`
  (password is hashed with SHA-256 via the Web Crypto API — this is
  still a browser-only demo, not production-grade security).
- **`/login`** — real sign-in against the accounts created via
  `/signup`, with validation and error states (wrong password, no
  such account, etc).
- **`/dashboard`** — shows the signed-in user's balance (starts at
  $30,000,000, a fictional demo figure), quick actions, a transfer
  form, and a transaction list.
- **`/settings`** — fully functional: edit full name and phone number,
  change password (requires current password), and view account
  details (member since, account type, currency).

## How the transfer form behaves

The transfer form is fully validated — recipient name, a real account
number format, and an amount that's properly currency-formatted and
checked against the current balance. On submit, it always resolves
with a genuine, clearly-stated failure: a popup explains that the
daily transfer limit for new demo accounts has been reached, and that
no funds have moved. It does **not** claim success when nothing
happened — that would be a deceptive pattern, so it isn't included.
If you want the transfer to actually succeed and post to the
transaction list instead, that's a straightforward change in
`app/dashboard/page.js`.

## What it deliberately does NOT do

- Does not send anything to a server — this is a client-only demo;
  all "accounts" live in the browser's `localStorage`.
- Does not claim a transfer succeeded when it didn't.
- Does not use any real bank's logo, trademark, or trade dress.

## Running it locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000 — you'll land on `/login`, from where
you can create a new demo account via `/signup`.

## Customizing

- Change the starting balance in `app/lib/auth.js` (`balance: 30000000`
  inside `signUp`).
- Change the transfer failure reason in `app/dashboard/page.js`.
- Colors/branding live in `app/globals.css`.

## Before using this anywhere public

Keep the demo banner and terms disclosure intact. Don't restyle this
to imitate a specific real bank's branding, and don't repurpose the
auth layer to collect real user credentials for anything other than
this local demo.
