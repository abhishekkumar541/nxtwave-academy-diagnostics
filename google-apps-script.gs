/**
 * Login logger for NxtWave Academy Diagnostics.
 *
 * SETUP (2 minutes):
 * 1. Create a Google Sheet. In row 1 add headers:  Timestamp | Email
 * 2. Extensions → Apps Script. Delete the default code, paste THIS file.
 * 3. Click Deploy → New deployment → type "Web app".
 *      - Execute as: Me
 *      - Who has access: Anyone
 *    Deploy, authorize, and COPY the Web app URL (ends in /exec).
 * 4. Put that URL in the app's env as SHEETS_WEBHOOK_URL
 *    (locally: .env.local ; on Vercel: Project → Settings → Environment Variables).
 *
 * Every login then appends a row: [ISO timestamp, email].
 */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    sheet.appendRow([data.ts || new Date().toISOString(), data.email || ""]);
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Optional: lets you open the /exec URL in a browser to confirm it's live.
function doGet() {
  return ContentService.createTextOutput("NxtWave login logger is live.");
}
