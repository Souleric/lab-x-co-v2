/* ============================================================
   LEAD CAPTURE DEMO — shared settings for all three games
   and the hub page (index.html).

   1. Follow README.md to deploy the Google Apps Script.
   2. Paste the "Web app URL" it gives you into SHEET_ENDPOINT.
   3. Paste the normal Google Sheet link into SHEET_VIEW_URL so the
      hub page can link the client straight to the collected rows.
   ============================================================ */

window.LEAD_DEMO = {

  // Apps Script web app URL. Looks like:
  // https://script.google.com/macros/s/AKfycb.../exec
  SHEET_ENDPOINT: "https://script.google.com/macros/s/AKfycbw_eq3zAxTSekBl6oCJp_3R3p5oH3f3b6l6Y4eIQeSLwoj0miVQgx74foQPB2khDYyjMw/exec",

  // The Google Sheet itself (share as "Anyone with the link – Viewer"
  // if the client should be able to open it during the demo).
  SHEET_VIEW_URL: "https://docs.google.com/spreadsheets/d/1PX52dAug6T_AwNi4-DWCr9VwBChncTvh6ukW7kmf0hA/edit",

  // Shown on the hub page
  CLIENT_NAME: "Your Restaurant"
};
