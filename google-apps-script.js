// 1. Go to https://sheets.new to create a new Google Sheet
// 2. Go to Extensions > Apps Script
// 3. Paste this entire code there (replace everything else)
// 4. Click Deploy > New Deployment > Select "Web App"
// 5. Set "Who has access" to "Anyone" (IMPORTANT!)
// 6. Click Deploy and copy the Web App URL
// 7. Paste the URL in your index.html and admin.html

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = doc.getSheetByName('Sheet1'); // Ensure your sheet name is "Sheet1"

    // If sheet doesn't exist, create it and add headers
    if (!sheet) {
      sheet = doc.insertSheet('Sheet1');
      sheet.appendRow(['Name', 'Relation/Answer', 'Date', 'Time']);
    }

    var data = JSON.parse(e.postData.contents);
    
    // Determine what to save based on input
    var name = data.name || 'Anonymous';
    var relationOrAnswer = data.relation || data.answer || '-';
    var date = data.date || new Date().toLocaleDateString();
    var time = data.time || new Date().toLocaleTimeString();

    var newRow = [name, relationOrAnswer, date, time];

    sheet.appendRow(newRow);

    return ContentService
      .createTextOutput(JSON.stringify({ "result": "success", "row": sheet.getLastRow() }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  catch (e) {
    return ContentService
      .createTextOutput(JSON.stringify({ "result": "error", "error": e.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  finally {
    lock.releaseLock();
  }
}

function doGet(e) {
   var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
   if (!sheet) {
     return ContentService.createTextOutput(JSON.stringify([]))
       .setMimeType(ContentService.MimeType.JSON);
   }
   
   var data = sheet.getDataRange().getValues();
   var jsonData = [];
   
   // Start from 1 to skip headers
   for(var i=1; i<data.length; i++) {
     jsonData.push({
       name: data[i][0],
       relation: data[i][1], // This column stores both Relation and Answer
       date: data[i][2],
       time: data[i][3]
     });
   }
   
   return ContentService.createTextOutput(JSON.stringify(jsonData))
     .setMimeType(ContentService.MimeType.JSON);
}
