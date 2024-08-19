function doGet() {
  var output = ContentService.createTextOutput(JSON.stringify(incrementCounter()));
  output.setMimeType(ContentService.MimeType.JSON);
  output.setHeader("Access-Control-Allow-Origin", "*");
  return output;
}

function incrementCounter() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var range = sheet.getRange("A1");
  var currentValue = range.getValue();
  range.setValue(currentValue + 1);
  return currentValue + 1;
}
