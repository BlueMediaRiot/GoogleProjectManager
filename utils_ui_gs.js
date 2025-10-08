/**
 * Utils/Ui.gs - UI constants, formatting, and common widgets
 */

const UI = {
  COLORS: {
    PRIMARY: '#4285f4',
    SUCCESS: '#34a853',
    WARNING: '#fbbc04',
    DANGER: '#ea4335',
    GRAY: '#5f6368'
  },
  
  ICONS: {
    PROJECT: 'VIDEO_CAMERA',
    PERSON: 'PERSON',
    CALENDAR: 'EVENT_SEAT',
    DOCUMENT: 'DESCRIPTION',
    LOCATION: 'PLACE',
    CHARACTER: 'STAR',
    TASK: 'CHECK_CIRCLE',
    LINK: 'LINK',
    SETTINGS: 'SETTINGS',
    ADD: 'ADD',
    EDIT: 'EDIT',
    DELETE: 'DELETE',
    DONE: 'CHECK_CIRCLE',
    OPEN: 'OPEN_IN_NEW',
    SEARCH: 'SEARCH'
  },
  
  PHASES: [
    'Development',
    'Pre-Production',
    'Production',
    'Post-Production',
    'Delivery'
  ],
  
  DEFAULT_STEPS: {
    'Development': ['Storyboard', 'Brief'],
    'Pre-Production': ['Producer', 'Director', 'Line Producer', 'Crew', 'Casting', 'Location', 'Shot List', 'Shooting Schedule'],
    'Production': ['Shooting Day(s)'],
    'Post-Production': ['First Rough Cut', 'First Correction', 'Second Correction', 'Picture Lock'],
    'Delivery': ['Rights Ownership', 'Deliverables']
  },
  
  PRIORITIES: ['Low', 'Medium', 'High', 'Critical'],
  
  STATUSES: ['Open', 'In Progress', 'Done']
};

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @return {string} Formatted date string
 */
function formatDate_(date) {
  if (!date) return 'No date';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return 'Invalid date';
  
  return Utilities.formatDate(d, Session.getScriptTimeZone(), 'MMM dd, yyyy');
}

/**
 * Format date and time for display
 * @param {Date|string} date - Date to format
 * @return {string} Formatted date-time string
 */
function formatDateTime_(date) {
  if (!date) return 'No date';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return 'Invalid date';
  
  return Utilities.formatDate(d, Session.getScriptTimeZone(), 'MMM dd, yyyy HH:mm');
}

/**
 * Create a status chip widget
 * @param {string} status - Status text
 * @return {Widget} Chip widget
 */
function createStatusChip_(status) {
  let color = UI.COLORS.GRAY;
  if (status === 'Done') color = UI.COLORS.SUCCESS;
  else if (status === 'In Progress') color = UI.COLORS.WARNING;
  
  return CardService.newDecoratedText()
    .setText(status)
    .setWrapText(false);
}

/**
 * Create a priority chip widget
 * @param {string} priority - Priority text
 * @return {Widget} Chip widget
 */
function createPriorityChip_(priority) {
  let icon = CardService.Icon.STAR;
  if (priority === 'Critical') icon = CardService.Icon.STAR;
  else if (priority === 'High') icon = CardService.Icon.FLIGHT_ARRIVAL;
  else if (priority === 'Medium') icon = CardService.Icon.BOOKMARK;
  
  return CardService.newDecoratedText()
    .setText(priority || 'Medium')
    .setStartIcon(CardService.newIconImage().setIcon(icon))
    .setWrapText(false);
}

/**
 * Create a person chip widget
 * @param {Object} person - Person object with name and email
 * @return {Widget} Person widget
 */
function createPersonChip_(person) {
  if (!person) return null;
  
  return CardService.newDecoratedText()
    .setText(person.name || person.email || 'Unknown')
    .setStartIcon(CardService.newIconImage().setIcon(CardService.Icon.PERSON))
    .setWrapText(false);
}

/**
 * Create a navigation button
 * @param {string} text - Button text
 * @param {string} functionName - Function to call
 * @param {Object} parameters - Parameters to pass
 * @return {Widget} Button widget
 */
function createNavButton_(text, functionName, parameters) {
  const button = CardService.newTextButton()
    .setText(text)
    .setOnClickAction(CardService.newAction()
      .setFunctionName(functionName)
      .setParameters(parameters || {})
      .setLoadIndicator(CardService.LoadIndicator.SPINNER));
  
  return button;
}

/**
 * Create an action button with icon
 * @param {string} icon - Icon name from UI.ICONS
 * @param {string} functionName - Function to call
 * @param {Object} parameters - Parameters to pass
 * @return {Widget} Icon button widget
 */
function createIconButton_(icon, functionName, parameters) {
  const iconEnum = CardService.Icon[icon] || CardService.Icon.STAR;
  
  return CardService.newImageButton()
    .setIconUrl('https://www.gstatic.com/images/icons/material/system/1x/add_black_24dp.png')
    .setOnClickAction(CardService.newAction()
      .setFunctionName(functionName)
      .setParameters(parameters || {}));
}

/**
 * Generate unique ID
 * @return {string} Unique ID
 */
function generateId_() {
  return Utilities.getUuid();
}

/**
 * Get current user email
 * @return {string} User email
 */
function getCurrentUserEmail_() {
  return Session.getActiveUser().getEmail();
}

/**
 * Create a divider widget
 * @return {Widget} Divider
 */
function createDivider_() {
  return CardService.newDivider();
}

/**
 * Create a button set for actions
 * @param {Array} buttons - Array of button configs
 * @return {Widget} ButtonSet widget
 */
function createButtonSet_(buttons) {
  const buttonSet = CardService.newButtonSet();
  
  buttons.forEach(btn => {
    const button = CardService.newTextButton()
      .setText(btn.text)
      .setOnClickAction(CardService.newAction()
        .setFunctionName(btn.functionName)
        .setParameters(btn.parameters || {}));
    
    if (btn.filled) {
      button.setTextButtonStyle(CardService.TextButtonStyle.FILLED);
    }
    
    buttonSet.addButton(button);
  });
  
  return buttonSet;
}
