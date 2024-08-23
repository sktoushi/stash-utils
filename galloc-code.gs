function doGet(e) {
  const action = e.parameter.action;
  const repo = e.parameter.repo;
  const content = e.parameter.content;

  if (action === 'add') {
    return addContentToSheet(repo, content);
  }

  return HtmlService.createHtmlOutputFromFile('index');
}

function getRandomContentFromSheet(repo) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(repo);
    if (!sheet) {
        return 'Sheet not found';
    }

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
        return 'No content available';
    }

    // Randomly select a row (skipping the header row)
    const randomIndex = Math.floor(Math.random() * (data.length - 1)) + 1;
    const content = data[randomIndex][1]; // Assuming 'content' is in the second column

    return content;
}

function addContentToSheet(repo, content) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(repo);

  if (!sheet) {
    return HtmlService.createHtmlOutput('Sheet not found.');
  }

  // Get the current issue number
  let issueNumber = 1;

  if (sheet.getLastRow() > 0) { // Check if there are existing rows
    issueNumber = sheet.getRange(sheet.getLastRow(), 1).getValue() + 1; // Increment the last issue number
  }

  // Append new row with incremented issueNumber and content
  sheet.appendRow([issueNumber, content]);

  return issueNumber; // Return the new issueNumber
}

function getLatestIssueNumber(repo) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(repo);

  if (!sheet) {
    return HtmlService.createHtmlOutput('Sheet not found.');
  }

  const data = sheet.getDataRange().getValues();
  let latestIssueNumber = 0;

  if (data.length > 1) { // Check if there are existing rows
    latestIssueNumber = data[data.length - 1][0]; // Get the last issue number
  }

  return latestIssueNumber;
}

function addFrequencyMod(username, repo, issueNumber, frequency) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('frequencyMod');

  if (!sheet) {
    return HtmlService.createHtmlOutput('FrequencyMod sheet not found.');
  }

  // Append new row with provided details
  sheet.appendRow([username, repo, issueNumber, frequency]);

  return HtmlService.createHtmlOutput('Frequency mod added successfully!');
}

function getRangesData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('ranges');
  const data = sheet.getDataRange().getValues();
  
  const config = data.slice(1).map(row => ({
    username: row[0],
    repo: row[1],
    startIdx: row[2],
    endIdx: row[3]
  }));
  
  return config;
}

function getFrequencyModsData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('frequencyMod');
  const data = sheet.getDataRange().getValues();
  
  const frequencyMods = {};

  data.slice(1).forEach(row => {
    const key = `${row[0]}-${row[1]}`;
    const issueNumber = row[2];
    const frequency = row[3];

    if (!frequencyMods[key]) {
      frequencyMods[key] = {};
    }
    frequencyMods[key][issueNumber] = frequency;
  });
  
  return frequencyMods;
}

function getContentFromSheet(repo, selectedIndex) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(repo);
  const data = sheet.getDataRange().getValues();
  
  // Assuming 'issueNumber' is in the first column and 'content' is in the second column
  const headers = data[0];
  const issueNumberIndex = headers.indexOf('issueNumber');
  const contentIndex = headers.indexOf('content');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][issueNumberIndex] == selectedIndex) {
      return data[i][contentIndex];
    }
  }
  return 'Content not found';
}
