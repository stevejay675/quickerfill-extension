// QuickFill Pro - Popup Controller

// DOM Elements
const fillButton = document.getElementById('fillButton');
const clearButton = document.getElementById('clearButton');
const statusDiv = document.getElementById('status');
const totalFieldsEl = document.getElementById('totalFields');
const filledFieldsEl = document.getElementById('filledFields');
const skippedFieldsEl = document.getElementById('skippedFields');

// Settings
const fillEmptyOnlyToggle = document.getElementById('fillEmptyOnly');
const skipPasswordsToggle = document.getElementById('skipPasswords');
const visualFeedbackToggle = document.getElementById('visualFeedback');
const fillDropdownsToggle = document.getElementById('fillDropdowns');

// Tab switching
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const tabName = tab.dataset.tab;
    
    // Remove active class from all tabs and contents
    tabs.forEach(t => t.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));
    
    // Add active class to clicked tab and corresponding content
    tab.classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
  });
});

// Load saved settings
chrome.storage.sync.get({
  fillEmptyOnly: false,
  skipPasswords: false,
  visualFeedback: true,
  fillDropdowns: true
}, (items) => {
  fillEmptyOnlyToggle.checked = items.fillEmptyOnly;
  skipPasswordsToggle.checked = items.skipPasswords;
  visualFeedbackToggle.checked = items.visualFeedback;
  fillDropdownsToggle.checked = items.fillDropdowns;
});

// Save settings when changed
[fillEmptyOnlyToggle, skipPasswordsToggle, visualFeedbackToggle, fillDropdownsToggle].forEach(toggle => {
  toggle.addEventListener('change', () => {
    chrome.storage.sync.set({
      fillEmptyOnly: fillEmptyOnlyToggle.checked,
      skipPasswords: skipPasswordsToggle.checked,
      visualFeedback: visualFeedbackToggle.checked,
      fillDropdowns: fillDropdownsToggle.checked
    });
  });
});

// Detect forms on page load
chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
  if (tabs[0]) {
    try {
      const response = await chrome.tabs.sendMessage(tabs[0].id, { action: 'detectForms' });
      if (response && response.count !== undefined) {
        updateStats(response.count, 0, 0);
      }
    } catch (error) {
      // Page might not have content script loaded yet
      console.log('Page not ready yet');
    }
  }
});

// Fill Forms Button
fillButton.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  // Get current settings
  const settings = {
    fillEmptyOnly: fillEmptyOnlyToggle.checked,
    skipPasswords: skipPasswordsToggle.checked,
    visualFeedback: visualFeedbackToggle.checked,
    fillDropdowns: fillDropdownsToggle.checked
  };
  
  fillButton.disabled = true;
  fillButton.innerHTML = '<span>⏳</span> Filling...';
  
  try {
    const response = await chrome.tabs.sendMessage(tab.id, { 
      action: 'fillForms',
      settings: settings
    });
    
    if (response) {
      if (response.total === 0) {
        showStatus('No forms found on this page', 'info');
        updateStats(0, 0, 0);
      } else {
        showStatus(
          `✓ Successfully filled ${response.filled} of ${response.total} fields` +
          (response.skipped > 0 ? ` (${response.skipped} skipped)` : ''),
          'success'
        );
        updateStats(response.total, response.filled, response.skipped);
      }
    }
  } catch (error) {
    showStatus('Error: Could not connect to page. Try refreshing.', 'error');
    console.error(error);
  } finally {
    fillButton.disabled = false;
    fillButton.innerHTML = ' Fill Forms';
  }
});

// Clear Forms Button
clearButton.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  clearButton.disabled = true;
  clearButton.innerHTML = '<span>⏳</span> Clearing...';
  
  try {
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'clearForms' });
    
    if (response) {
      if (response.cleared === 0) {
        showStatus('No forms to clear on this page', 'info');
      } else {
        showStatus(`✓ Cleared ${response.cleared} fields`, 'success');
        updateStats(response.cleared, 0, 0);
      }
    }
  } catch (error) {
    showStatus('Error: Could not connect to page. Try refreshing.', 'error');
    console.error(error);
  } finally {
    clearButton.disabled = false;
    clearButton.innerHTML = ' Clear All';
  }
});

// Helper: Show status message
function showStatus(message, type) {
  statusDiv.textContent = message;
  statusDiv.className = `show ${type}`;
  
  setTimeout(() => {
    statusDiv.classList.remove('show');
  }, 5000);
}

// Helper: Update stats display
function updateStats(total, filled, skipped) {
  totalFieldsEl.textContent = total;
  filledFieldsEl.textContent = filled;
  skippedFieldsEl.textContent = skipped;
}