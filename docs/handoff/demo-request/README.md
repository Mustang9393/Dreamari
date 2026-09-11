# Demo request delivery

The Schools page form posts to `/api/demo-request` (Next.js route). The route
delivers, in order: `DEMO_REQUEST_WEBHOOK`, then `RESEND_API_KEY`, then the
Vercel function log. It always acknowledges, so the page never dead-ends.

## Google Sheet + email (recommended, no third-party service)

Sheet: "Dreamari demo requests" in Dreamari UX Docs
https://docs.google.com/spreadsheets/d/1BHZV8ExKctp2K5OyMRyHs3kwdGp0gs2zJ2XZeZF5j6A/edit

1. Open the sheet, Extensions > Apps Script, paste `apps-script.gs`, save.
2. Deploy > New deployment > type Web app. Execute as: Me. Who has access:
   Anyone. Deploy, authorize, copy the web app URL.
3. Vercel > Project > Settings > Environment Variables:
   `DEMO_REQUEST_WEBHOOK` = that URL (Production and Preview). Redeploy.
4. Each request appends a row and emails product@dreamopportunity.org from
   the deploying account; the survey answers fill columns G to I of the same
   row and send a second, shorter email.

Edit the script later? Deploy > Manage deployments > edit > New version.

## Fallback: Resend

Set `RESEND_API_KEY`, `DEMO_REQUEST_FROM` (a verified sender on your domain)
and optionally `DEMO_REQUEST_TO` (default product@dreamopportunity.org).
