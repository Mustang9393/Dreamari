// Dreamari demo requests: Google Apps Script bound to the sheet
// "Dreamari demo requests" (Dreamari UX Docs folder). Deployed as a web app,
// it receives each POST from /api/demo-request, appends a row, and emails
// the inbox. Two posts arrive per request (step "request", then "survey")
// with the same Request id, so the survey answers land on the request's row.
//
// Deploy: Extensions > Apps Script > paste this > Deploy > New deployment >
// Web app, Execute as: Me, Who has access: Anyone > copy the URL into the
// Vercel env var DEMO_REQUEST_WEBHOOK. Re-deploy after any edit.

const NOTIFY_TO = "product@dreamopportunity.org";
const SHEET_NAME = "Sheet1";

function doPost(e) {
  const body = JSON.parse(e.postData.contents || "{}");
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const now = body.receivedAt || new Date().toISOString();

  if (body.step === "survey") {
    // find the request row by id and fill in the survey columns (G:I)
    const ids = sheet.getRange(2, 3, Math.max(sheet.getLastRow() - 1, 1), 1).getValues();
    for (let i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === String(body.id)) {
        sheet.getRange(i + 2, 7, 1, 3).setValues([[body.role || "", body.orgType || "", body.students || ""]]);
        MailApp.sendEmail({
          to: NOTIFY_TO,
          subject: "Demo request details: " + (body.organization || body.id),
          body: ["Role: " + (body.role || "not given"), "Organization type: " + (body.orgType || "not given"), "Students served: " + (body.students || "not given"), "", "Request id: " + body.id, "Sheet: " + SpreadsheetApp.getActiveSpreadsheet().getUrl()].join("\n"),
        });
        return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
      }
    }
  }

  sheet.appendRow([now, body.step || "request", body.id || "", body.name || "", body.email || "", body.organization || "", body.role || "", body.orgType || "", body.students || "", body.page || ""]);
  MailApp.sendEmail({
    to: NOTIFY_TO,
    replyTo: body.email || undefined,
    subject: "Demo request: " + (body.organization || "unknown organization"),
    body: ["Name: " + (body.name || ""), "Work email: " + (body.email || ""), "Organization: " + (body.organization || ""), "", "Request id: " + body.id, "From: " + (body.page || ""), "Sheet: " + SpreadsheetApp.getActiveSpreadsheet().getUrl()].join("\n"),
  });
  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}

// Lets a browser GET confirm the deployment is live.
function doGet() {
  return ContentService.createTextOutput("Dreamari demo requests webhook is live.");
}
