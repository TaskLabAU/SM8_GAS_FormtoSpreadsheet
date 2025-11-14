const CHAT_WEBHOOK_URL = 'CHAT_URL';

const SPREADSHEET_ID = 'SPREADSHEET_ID';  // between /d/ and /edit in the URL

const SHEET_NAME = "Sheet1";

function doPost(e) {
  // Log at the very top so we know this function is actually running
  console.log('doPost hit', JSON.stringify({
    hasE: !!e,
    hasPostData: !!(e && e.postData),
    contentType: e && e.postData ? e.postData.type : null
  }));

  try {
    const params = e && e.parameter ? e.parameter : {};
    const mode = params.mode;
    const challenge = params.challenge;

    // 1. ServiceM8 subscribe handshake
    if (mode === 'subscribe' && challenge) {
      console.log('Subscribe challenge received:', challenge);
      return ContentService
        .createTextOutput(challenge)
        .setMimeType(ContentService.MimeType.TEXT);
    }

    // 2. Normal webhook payload
    const rawBody = e && e.postData && e.postData.contents ? e.postData.contents : '';
    const contentType = e && e.postData ? e.postData.type : 'unknown';

    console.log('Normal webhook path. Content-Type:', contentType);
    console.log('Raw body length:', rawBody ? rawBody.length : 0);

    if (!rawBody) {
      console.log('No body received');
      return ContentService
        .createTextOutput('No body')
        .setMimeType(ContentService.MimeType.TEXT);
    }

    let data;
    try {
      data = JSON.parse(rawBody);
    } catch (parseErr) {
      console.error('JSON parse error:', parseErr);
      // Still send something to Chat so you can see what came in
      safePostToChat({
        text: [
          '*Webhook received but JSON.parse failed*',
          '',
          'Error:',
          '```',
          String(parseErr),
          '```',
          '',
          'Raw body:',
          '```',
          rawBody.substring(0, 2000), // avoid massive payload
          '```'
        ].join('\n')
      });
      return ContentService
        .createTextOutput('Bad JSON')
        .setMimeType(ContentService.MimeType.TEXT);
    }

    // 3. Spreadsheet write
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    console.log('Opened spreadsheet:', ss.getName());
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      throw new Error('Sheet not found: ' + SHEET_NAME);
    }

    const timestamp = new Date();
    const jobUuid  = data.regarding_object_uuid || '';
    const formUuid = data.form_uuid || '';

    const row = [
      timestamp,
      jobUuid,
      formUuid,
      JSON.stringify(data)
    ];

    sheet.appendRow(row);
    console.log('Appended row:', JSON.stringify(row));

    // 4. Post to Chat
    safePostToChat({
      text: [
        '*ServiceM8 Webhook Received*',
        '',
        '*Content-Type:* ' + contentType,
        '',
        '*Row written to sheet:*',
        '```',
        JSON.stringify(row, null, 2),
        '```'
      ].join('\n')
    });

    return ContentService
      .createTextOutput('OK')
      .setMimeType(ContentService.MimeType.TEXT);

  } catch (err) {
    console.error('Error in doPost:', err && err.stack ? err.stack : err);
    // Try to notify Chat as well
    safePostToChat({
      text: [
        '*ServiceM8 Webhook Error*',
        '',
        '```',
        String(err && err.stack ? err.stack : err),
        '```'
      ].join('\n')
    });

    return ContentService
      .createTextOutput('Error: ' + err)
      .setMimeType(ContentService.MimeType.TEXT);
  }
}

// ====== Helper to safely post to Chat ======
function safePostToChat(payload) {
  try {
    if (!CHAT_WEBHOOK_URL) {
      console.log('CHAT_WEBHOOK_URL not set, skipping Chat post');
      return;
    }
    const res = UrlFetchApp.fetch(CHAT_WEBHOOK_URL, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    console.log('Chat response code:', res.getResponseCode());
    console.log('Chat response body:', res.getContentText());
  } catch (err) {
    console.error('Error posting to Chat:', err);
  }
}
