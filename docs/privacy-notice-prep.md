# Privacy notice preparation

This is an internal inventory for writing the public Datenschutz / Privacy Policy. It is not a published legal notice.

## What the application currently handles

| Data | Why | Where |
| --- | --- | --- |
| Name, email, password hash, Google account identifier if linked, account timestamps | Account access | Express + MongoDB Atlas |
| Applications, job descriptions, notes, salaries, follow-ups and interview preparation | The user's job-search workspace | Express + MongoDB Atlas |
| Authentication cookie | Maintain the sign-in session | Browser, signed by Express |
| Email verification address and one-time link | Confirm access to the address | Express and Brevo transactional email; only a hash of the token is stored in MongoDB |

Demo accounts and their workspace records have a seven-day expiry. Unverified new password accounts have a seven-day expiry. A 30-minute verification link can be resent after a one-minute cooldown. Ordinary registered accounts do **not** currently have a defined deletion schedule or a self-service account deletion endpoint. Do not claim otherwise in the public notice.

The deployment uses Vercel (frontends), Render (API), MongoDB Atlas (database), Google (optional sign-in), and Brevo (verification mail when enabled). Provider infrastructure, access logs, subprocessors, storage regions and international transfers need to be checked against the actual account settings and contracts before publishing.

## Decisions needed before publishing

1. Name and contact address of the person or entity responsible for RoleNaviq; optional representative/DPO only if applicable.
2. Purpose and legal basis for each processing activity (account, workspace, security/session, email verification, Google sign-in). Check whether any additional local storage, analytics, or cookies are used.
3. Data retention for ordinary accounts, backups, access logs, and Brevo message logs; process for account deletion and data requests.
4. Exact regions, processors, international transfers and any applicable safeguards from the live service settings and data processing agreements.
5. Where users can request access, correction, export or deletion and lodge a complaint with a supervisory authority.

Once these answers are verified, publish a readable privacy notice linked from the landing page, registration page and Google OAuth consent screen. Have a qualified privacy professional review the finished wording for the deployment jurisdiction.
