// QuickFill Pro - Content Script with Smart Detection
console.log('QuickFill Pro loaded');

// Store original values for clear functionality
let originalValues = new Map();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'detectForms') {
    const count = detectFormFields();
    sendResponse({ count: count });
  } 
  else if (request.action === 'fillForms') {
    const result = fillAllForms(request.settings || {});
    sendResponse(result);
  }
  else if (request.action === 'clearForms') {
    const result = clearAllForms();
    sendResponse(result);
  }
  return true;
});

// Detect how many fillable fields exist on the page
function detectFormFields() {
  const fields = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([disabled]):not([readonly]), textarea:not([disabled]):not([readonly]), select:not([disabled])');
  const visibleFields = Array.from(fields).filter(field => isVisible(field));
  return visibleFields.length;
}

// Check if element is visible
function isVisible(element) {
  return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
}

// Built-in fake data generators
const fakeData = {
  firstName: () => ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma', 'James', 'Emily', 'Robert', 'Lisa', 'William', 'Olivia'][Math.floor(Math.random() * 12)],
  lastName: () => ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Wilson', 'Anderson'][Math.floor(Math.random() * 12)],
  email: () => `testuser${Math.floor(Math.random() * 10000)}@example.com`,
  phone: () => `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
  username: () => `user${Math.floor(Math.random() * 100000)}`,
  password: () => `SecurePass${Math.floor(Math.random() * 10000)}!@#`,
  company: () => ['Tech Innovations', 'Digital Solutions', 'Cloud Systems', 'Data Analytics Inc', 'Smart Industries', 'Global Enterprises'][Math.floor(Math.random() * 6)],
  jobTitle: () => ['Software Engineer', 'Product Manager', 'UX Designer', 'Data Analyst', 'Marketing Specialist', 'Project Manager'][Math.floor(Math.random() * 6)],
  street: () => `${Math.floor(Math.random() * 9999) + 1} ${['Main', 'Oak', 'Maple', 'Cedar', 'Pine', 'Elm', 'Washington'][Math.floor(Math.random() * 7)]} Street`,
  city: () => ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Diego', 'Dallas'][Math.floor(Math.random() * 8)],
  state: () => ['CA', 'NY', 'TX', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI'][Math.floor(Math.random() * 10)],
  zip: () => String(Math.floor(Math.random() * 90000) + 10000),
  country: () => ['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France'][Math.floor(Math.random() * 6)],
  url: () => `https://www.example${Math.floor(Math.random() * 100)}.com`,
  number: (min = 1, max = 100) => Math.floor(Math.random() * (max - min + 1)) + min,
  date: () => {
    const year = Math.floor(Math.random() * 30) + 1990;
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },
  paragraph: () => 'This is a comprehensive test description that provides enough detail for testing purposes. It includes multiple sentences to simulate real user input and can be used for various textarea fields, comment sections, and description boxes throughout the application.',
  word: () => ['Innovation', 'Technology', 'Solution', 'Platform', 'Service', 'Product'][Math.floor(Math.random() * 6)]
};

// Main function to fill all forms
function fillAllForms(settings) {
  const fields = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([disabled]):not([readonly]), textarea:not([disabled]):not([readonly]), select:not([disabled])');
  
  let totalFields = 0;
  let filledCount = 0;
  let skippedCount = 0;
  
  // Store original values before filling
  originalValues.clear();
  
  fields.forEach(field => {
    if (!isVisible(field)) return;
    
    totalFields++;
    
    // Store original value
    if (field.tagName.toLowerCase() === 'select') {
      originalValues.set(field, field.value);
    } else if (field.type === 'checkbox' || field.type === 'radio') {
      originalValues.set(field, field.checked);
    } else {
      originalValues.set(field, field.value);
    }
    
    // Skip if fillEmptyOnly is enabled and field has value
    if (settings.fillEmptyOnly && field.value && field.value.trim() !== '') {
      skippedCount++;
      return;
    }
    
    // Skip passwords if setting is enabled
    if (settings.skipPasswords && (field.type === 'password' || matchesPattern(getFieldInfo(field), ['password', 'pass', 'pwd']))) {
      skippedCount++;
      return;
    }
    
    // Skip dropdowns if setting is disabled
    if (!settings.fillDropdowns && field.tagName.toLowerCase() === 'select') {
      skippedCount++;
      return;
    }
    
    try {
      if (fillField(field, settings)) {
        filledCount++;
        
        // Visual feedback
        if (settings.visualFeedback) {
          highlightField(field);
        }
      } else {
        skippedCount++;
      }
    } catch (error) {
      console.error('Error filling field:', error);
      skippedCount++;
    }
  });
  
  console.log(`QuickFill: Filled ${filledCount}/${totalFields} fields (${skippedCount} skipped)`);
  
  return {
    total: totalFields,
    filled: filledCount,
    skipped: skippedCount
  };
}

// Clear all forms
function clearAllForms() {
  let clearedCount = 0;
  
  originalValues.forEach((originalValue, field) => {
    if (!isVisible(field)) return;
    
    try {
      if (field.tagName.toLowerCase() === 'select') {
        field.value = originalValue;
      } else if (field.type === 'checkbox' || field.type === 'radio') {
        field.checked = originalValue;
      } else {
        field.value = originalValue;
      }
      
      triggerEvents(field);
      clearedCount++;
    } catch (error) {
      console.error('Error clearing field:', error);
    }
  });
  
  originalValues.clear();
  
  return { cleared: clearedCount };
}

// Highlight field briefly
function highlightField(field) {
  const originalBorder = field.style.border;
  const originalBackground = field.style.background;
  
  field.style.border = '1px solid #4CAF50';
  // field.style.background = '#e8f5e9';
  field.style.transition = 'all 0.3s ease';
  
  setTimeout(() => {
    field.style.border = originalBorder;
    field.style.background = originalBackground;
  }, 800);
}

// Smart field filling
function fillField(field, settings) {
  const fieldInfo = getFieldInfo(field);
  const fieldType = field.type ? field.type.toLowerCase() : 'text';
  const tagName = field.tagName.toLowerCase();
  
  // Handle SELECT dropdowns
  if (tagName === 'select') {
    return fillSelect(field);
  }
  
  // Handle checkboxes
  if (fieldType === 'checkbox') {
    field.checked = Math.random() > 0.5;
    triggerEvents(field);
    return true;
  }
  
  // Handle radio buttons
  if (fieldType === 'radio') {
    if (Math.random() > 0.7) {
      field.checked = true;
      triggerEvents(field);
      return true;
    }
    return false;
  }
  
  // Handle date inputs
  if (fieldType === 'date') {
    field.value = fakeData.date();
    triggerEvents(field);
    return true;
  }
  
  if (fieldType === 'datetime-local') {
    field.value = fakeData.date() + 'T10:30';
    triggerEvents(field);
    return true;
  }
  
  if (fieldType === 'time') {
    const hour = String(fakeData.number(0, 23)).padStart(2, '0');
    const minute = String(fakeData.number(0, 59)).padStart(2, '0');
    field.value = `${hour}:${minute}`;
    triggerEvents(field);
    return true;
  }
  
  // Handle number/range inputs
  if (fieldType === 'range' || fieldType === 'number') {
    const min = parseInt(field.min) || 1;
    const max = parseInt(field.max) || 1000;
    field.value = fakeData.number(min, max);
    triggerEvents(field);
    return true;
  }
  
  // TEXT-BASED FIELDS - Smart detection
  let value = '';
  
  if (fieldType === 'email' || matchesPattern(fieldInfo, ['email', 'e-mail', 'mail'])) {
    value = fakeData.email();
  }
  else if (fieldType === 'password' || matchesPattern(fieldInfo, ['password', 'pass', 'pwd'])) {
    value = fakeData.password();
  }
  else if (fieldType === 'tel' || matchesPattern(fieldInfo, ['phone', 'tel', 'mobile', 'cell'])) {
    value = fakeData.phone();
  }
  else if (fieldType === 'url' || matchesPattern(fieldInfo, ['website', 'url', 'site', 'homepage'])) {
    value = fakeData.url();
  }
  else if (matchesPattern(fieldInfo, ['firstname', 'first-name', 'first_name', 'fname', 'given'])) {
    value = fakeData.firstName();
  }
  else if (matchesPattern(fieldInfo, ['lastname', 'last-name', 'last_name', 'lname', 'surname', 'family'])) {
    value = fakeData.lastName();
  }
  else if (matchesPattern(fieldInfo, ['fullname', 'full-name', 'name', 'full_name'])) {
    value = `${fakeData.firstName()} ${fakeData.lastName()}`;
  }
  else if (matchesPattern(fieldInfo, ['title', 'subject', 'heading', 'summary'])) {
    value = `Test ${fakeData.word()} ${fakeData.number(1, 1000)}`;
  }
  else if (matchesPattern(fieldInfo, ['username', 'user', 'login', 'account'])) {
    value = fakeData.username();
  }
  else if (matchesPattern(fieldInfo, ['company', 'organization', 'employer', 'business'])) {
    value = fakeData.company();
  }
  else if (matchesPattern(fieldInfo, ['job', 'position', 'role', 'occupation'])) {
    value = fakeData.jobTitle();
  }
  else if (matchesPattern(fieldInfo, ['address', 'street', 'address1'])) {
    value = fakeData.street();
  }
  else if (matchesPattern(fieldInfo, ['city', 'town'])) {
    value = fakeData.city();
  }
  else if (matchesPattern(fieldInfo, ['state', 'province', 'region'])) {
    value = fakeData.state();
  }
  else if (matchesPattern(fieldInfo, ['zip', 'postal', 'postcode', 'zipcode'])) {
    value = fakeData.zip();
  }
  else if (matchesPattern(fieldInfo, ['country'])) {
    value = fakeData.country();
  }
  else if (matchesPattern(fieldInfo, ['amount', 'price', 'cost', 'budget', 'fee'])) {
    value = fakeData.number(50, 5000);
  }
  else if (matchesPattern(fieldInfo, ['hour', 'duration', 'estimate', 'completion'])) {
    value = fakeData.number(1, 40);
  }
  else if (matchesPattern(fieldInfo, ['category', 'type', 'kind'])) {
    value = fakeData.word();
  }
  else if (tagName === 'textarea' || matchesPattern(fieldInfo, ['description', 'comment', 'message', 'bio', 'about', 'notes', 'details', 'content', 'body'])) {
    value = fakeData.paragraph();
  }
  else if (fieldType === 'search' || matchesPattern(fieldInfo, ['search', 'query'])) {
    value = fakeData.word();
  }
  else {
    value = `Test ${fakeData.word()}`;
  }
  
  field.value = value;
  triggerEvents(field);
  return true;
}

// Get field information
function getFieldInfo(field) {
  const info = {
    name: (field.name || '').toLowerCase(),
    id: (field.id || '').toLowerCase(),
    placeholder: (field.placeholder || '').toLowerCase(),
    ariaLabel: (field.getAttribute('aria-label') || '').toLowerCase(),
    className: (field.className || '').toLowerCase(),
    label: ''
  };
  
  if (field.id) {
    const label = document.querySelector(`label[for="${field.id}"]`);
    if (label) {
      info.label = label.textContent.toLowerCase();
    }
  }
  
  if (!info.label) {
    const parentLabel = field.closest('label');
    if (parentLabel) {
      info.label = parentLabel.textContent.toLowerCase();
    }
  }
  
  return info;
}

// Check if field matches patterns
function matchesPattern(fieldInfo, patterns) {
  const allText = `${fieldInfo.name} ${fieldInfo.id} ${fieldInfo.placeholder} ${fieldInfo.ariaLabel} ${fieldInfo.className} ${fieldInfo.label}`;
  return patterns.some(pattern => allText.includes(pattern));
}

// Fill select dropdowns
function fillSelect(select) {
  const options = Array.from(select.options).filter(opt => opt.value && opt.value !== '' && !opt.disabled);
  if (options.length > 0) {
    const validOptions = options.filter((opt, idx) => idx > 0 || opt.value !== '');
    if (validOptions.length > 0) {
      const randomOption = validOptions[Math.floor(Math.random() * validOptions.length)];
      select.value = randomOption.value;
      triggerEvents(select);
      return true;
    }
  }
  return false;
}

// Trigger events
function triggerEvents(field) {
  field.dispatchEvent(new Event('input', { bubbles: true }));
  field.dispatchEvent(new Event('change', { bubbles: true }));
  field.dispatchEvent(new Event('blur', { bubbles: true }));
  
  // React compatibility
  try {
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(field, field.value);
      field.dispatchEvent(new Event('input', { bubbles: true }));
    }
  } catch (e) {
    // Ignore if React compatibility fails
  }
}