let isExporting = false;
let userConfigFields = [];

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'start_export') {
    isExporting = true;
    userConfigFields = request.fields;
    startScraping(request.fields);
    sendResponse({ status: 'started' });
  } else if (request.action === 'stop_export') {
    isExporting = false;
    sendResponse({ status: 'stopped' });
  }
});

async function startScraping(fields) {
  try {
    reportProgress('Waiting for table data to load...');

    // ACTION: Wait strictly for ROWS to exist.
    const rowsFound = await waitForRows();

    if (!rowsFound) {
      throw new Error('Table data did not load in time. Please refresh the page and try again.');
    }

    const scrapedData = await scrapeAllPages();

    if (!isExporting) return; // Stopped

    if (scrapedData.length === 0) {
      throw new Error('Scraped 0 entries after waiting. Please verify you are on the "Practice History" page.');
    }

    reportProgress(`Successfully scraped ${scrapedData.length} entries. Generating JSON...`);

    const processedData = processData(scrapedData, fields);

    if (!isExporting) return;

    downloadJSON(processedData);

    chrome.runtime.sendMessage({ action: 'export_complete' });
    isExporting = false;

  } catch (error) {
    console.error(error);
    chrome.runtime.sendMessage({ action: 'export_error', message: error.message });
    isExporting = false;
  }
}

async function waitForRows() {
  // Poll for 10 seconds for rows to appear
  let attempts = 0;
  const maxAttempts = 50; // 50 * 200ms = 10 seconds

  return new Promise(resolve => {
    const check = () => {
      attempts++;
      // We look for rowgroup rows (data) AND ensure we ignore the header if possible, 
      // but mere existence of any row in 'rowgroup' is a good sign.
      const rows = document.querySelectorAll('[role="rowgroup"] [role="row"]');

      if (rows.length > 0) {
        reportProgress(`Found ${rows.length} rows... starting export.`);
        resolve(true);
      } else if (attempts >= maxAttempts) {
        resolve(false);
      } else {
        setTimeout(check, 200);
      }
    };
    check();
  });
}

async function scrapeAllPages() {
  let allEntries = [];
  let hasNext = true;
  let pageCount = 1;

  while (hasNext && isExporting) {
    // 1. Scrape current page
    const cleanEntries = scrapeCurrentPage();

    if (cleanEntries.length === 0) {
      // Only warn if it's the first page, otherwise might be end of list
      if (pageCount === 1) {
        reportProgress(`Warning: Page ${pageCount} seems empty. Retrying scan...`);
        await new Promise(r => setTimeout(r, 1000));
        const retry = scrapeCurrentPage();
        allEntries = allEntries.concat(retry);
      }
    } else {
      allEntries = allEntries.concat(cleanEntries);
    }

    reportProgress(`Scraped Page ${pageCount} (${allEntries.length} total items)...`);

    // 2. Try to go to next page
    hasNext = await goToNextPage();
    if (hasNext) {
      pageCount++;
      // Waiting for next page load
      await new Promise(r => setTimeout(r, 2000));
      await waitForRows(); // Wait for new rows to appear
    }
  }

  return allEntries;
}

function scrapeCurrentPage() {
  // Target specific structure: role="rowgroup" -> role="row"
  const rowGroups = document.querySelectorAll('[role="rowgroup"]');
  let dataRows = [];
  rowGroups.forEach(group => {
    const rows = group.querySelectorAll('[role="row"]');
    if (rows.length > 0) {
      dataRows = dataRows.concat(Array.from(rows));
    }
  });

  if (dataRows.length === 0) return [];

  const entries = [];

  dataRows.forEach(row => {
    try {
      const cells = Array.from(row.querySelectorAll('[role="cell"]'));

      if (cells.length < 4) return;

      const timeCell = cells[0];
      const problemCell = cells[1];
      // Skip status cell [2]
      const submissionsCell = cells[3]; // Fixed index based on provided HTML

      // 1. Timestamp
      const timestamp = timeCell.textContent.trim();

      // 2. Problem Info
      const problemLink = problemCell.querySelector('a');
      const problemText = problemCell.textContent;

      let id = 'N/A';
      let title = 'N/A';
      let difficulty = 'N/A';
      let url = '';

      if (problemLink) {
        url = problemLink.href;
        const linkText = problemLink.textContent.trim();
        // Parse "22. Generate Parentheses"
        const match = linkText.match(/^(\d+)\.\s*(.*)/);
        if (match) {
          id = match[1];
          title = match[2];
        } else {
          title = linkText;
        }
      } else {
        // Fallback text parse
        const match = problemText.match(/^(\d+)\.\s*(.*)/);
        if (match) {
          id = match[1];
          title = match[2].split('\n')[0]; // simple split
        }
      }

      // Difficulty from text "Med.", "Easy", "Hard"
      // Snippet shows "Med." in a div
      if (problemText.includes('Easy')) difficulty = 'Easy';
      else if (problemText.includes('Medium') || problemText.includes('Med.')) difficulty = 'Medium';
      else if (problemText.includes('Hard')) difficulty = 'Hard';

      // 3. Submissions
      const submissions = submissionsCell.textContent.trim();

      entries.push({
        id,
        title,
        difficulty,
        url,
        timestamp,
        submissions
      });

    } catch (e) {
      console.warn('Error parsing row', e);
    }
  });

  return entries;
}

async function goToNextPage() {
  const buttons = Array.from(document.querySelectorAll('button'));
  const nextBtn = buttons.find(b => {
    // Check aria-label or icon
    const aria = b.getAttribute('aria-label');
    if (aria && (aria.includes('next') || aria.includes('Next'))) return true;

    // Icon check (font awesome or svg)
    if (b.querySelector('svg[data-icon="chevron-right"]')) return true;
    if (b.querySelector('svg[data-icon="angle-right"]')) return true;

    return false;
  });

  if (nextBtn && !nextBtn.disabled) {
    nextBtn.click();
    return true;
  }
  return false;
}

function processData(data, fields) {
  return data.map(item => {
    const exportItem = {};
    fields.forEach(field => {
      switch (field) {
        case 'id': exportItem['ID'] = item.id; break;
        case 'title': exportItem['Title'] = item.title; break;
        case 'difficulty': exportItem['Difficulty'] = item.difficulty; break;
        case 'url': exportItem['URL'] = item.url; break;
        case 'timestamp': exportItem['Timestamp'] = item.timestamp; break;
        case 'submissions': exportItem['Submissions'] = item.submissions; break;
      }
    });
    return exportItem;
  });
}

function reportProgress(message) {
  chrome.runtime.sendMessage({ action: 'export_progress', message });
}

function downloadJSON(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `leetcode_history_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
