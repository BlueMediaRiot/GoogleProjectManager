/**
 * Models/Step.gs - Step data model and business logic
 */

/**
 * Create a new step
 * @param {Object} data - Step data
 * @return {Object} Created step
 */
function createStep_(data) {
  const step = {
    id: generateId_(),
    projectId: data.projectId,
    phase: data.phase,
    name: data.name || 'New Step',
    dueDate: data.dueDate || null,
    assigneeIds: data.assigneeIds || [],
    status: data.status || 'Open',
    notes: data.notes || '',
    linkedCalendarEventId: data.linkedCalendarEventId || null,
    linkedDriveFileIds: data.linkedDriveFileIds || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  Storage.saveStep(step);
  return step;
}

/**
 * Update existing step
 * @param {string} stepId - Step ID
 * @param {Object} data - Updated data
 * @return {Object} Updated step
 */
function updateStep_(stepId, data) {
  const step = Storage.getStep(stepId);
  if (!step) throw new Error('Step not found');
  
  const updated = {
    ...step,
    ...data,
    id: stepId,
    updatedAt: new Date().toISOString()
  };
  
  Storage.saveStep(updated);
  return updated;
}

/**
 * Delete step
 * @param {string} stepId - Step ID
 */
function deleteStep_(stepId) {
  const step = Storage.getStep(stepId);
  if (!step) return;
  
  // Delete associated calendar event if exists
  if (step.linkedCalendarEventId) {
    try {
      CalendarApp.getDefaultCalendar().getEventById(step.linkedCalendarEventId).deleteEvent();
    } catch (e) {
      Logger.log('Error deleting calendar event: ' + e.toString());
    }
  }
  
  Storage.deleteStep(stepId);
}

/**
 * Toggle step status between Open/In Progress/Done
 * @param {string} stepId - Step ID
 * @return {Object} Updated step
 */
function toggleStepStatus_(stepId) {
  const step = Storage.getStep(stepId);
  if (!step) throw new Error('Step not found');
  
  let newStatus = 'In Progress';
  if (step.status === 'Open') newStatus = 'In Progress';
  else if (step.status === 'In Progress') newStatus = 'Done';
  else newStatus = 'Open';
  
  return updateStep_(stepId, { status: newStatus });
}

/**
 * Assign people to step
 * @param {string} stepId - Step ID
 * @param {Array} personIds - Array of person IDs
 * @return {Object} Updated step
 */
function assignPeopleToStep_(stepId, personIds) {
  return updateStep_(stepId, { assigneeIds: personIds });
}

/**
 * Add person to step assignees
 * @param {string} stepId - Step ID
 * @param {string} personId - Person ID
 * @return {Object} Updated step
 */
function addAssigneeToStep_(stepId, personId) {
  const step = Storage.getStep(stepId);
  if (!step) throw new Error('Step not found');
  
  const assigneeIds = step.assigneeIds || [];
  if (!assigneeIds.includes(personId)) {
    assigneeIds.push(personId);
  }
  
  return updateStep_(stepId, { assigneeIds: assigneeIds });
}

/**
 * Remove person from step assignees
 * @param {string} stepId - Step ID
 * @param {string} personId - Person ID
 * @return {Object} Updated step
 */
function removeAssigneeFromStep_(stepId, personId) {
  const step = Storage.getStep(stepId);
  if (!step) throw new Error('Step not found');
  
  const assigneeIds = (step.assigneeIds || []).filter(id => id !== personId);
  return updateStep_(stepId, { assigneeIds: assigneeIds });
}

/**
 * Set step due date
 * @param {string} stepId - Step ID
 * @param {Date|string} dueDate - Due date
 * @return {Object} Updated step
 */
function setStepDueDate_(stepId, dueDate) {
  return updateStep_(stepId, { dueDate: dueDate });
}

/**
 * Link calendar event to step
 * @param {string} stepId - Step ID
 * @param {string} eventId - Calendar event ID
 * @return {Object} Updated step
 */
function linkCalendarEvent_(stepId, eventId) {
  return updateStep_(stepId, { linkedCalendarEventId: eventId });
}

/**
 * Link Drive file to step
 * @param {string} stepId - Step ID
 * @param {string} fileId - Drive file ID
 * @return {Object} Updated step
 */
function linkDriveFile_(stepId, fileId) {
  const step = Storage.getStep(stepId);
  if (!step) throw new Error('Step not found');
  
  const fileIds = step.linkedDriveFileIds || [];
  if (!fileIds.includes(fileId)) {
    fileIds.push(fileId);
  }
  
  return updateStep_(stepId, { linkedDriveFileIds: fileIds });
}

/**
 * Get steps assigned to current user
 * @param {string} projectId - Optional project ID to filter
 * @return {Array} Array of steps
 */
function getMySteps_(projectId) {
  const userEmail = getCurrentUserEmail_();
  const people = Storage.getPeople();
  const currentUser = people.find(p => p.email === userEmail);
  
  if (!currentUser) return [];
  
  let steps = projectId ? Storage.getSteps(projectId) : Storage.getAllSteps();
  
  steps = steps.filter(step => {
    return (step.assigneeIds || []).includes(currentUser.id);
  });
  
  steps.sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });
  
  return steps;
}

/**
 * Get overdue steps for project
 * @param {string} projectId - Project ID
 * @return {Array} Array of overdue steps
 */
function getOverdueSteps_(projectId) {
  const steps = Storage.getSteps(projectId);
  const now = new Date();
  
  return steps.filter(step => {
    if (!step.dueDate || step.status === 'Done') return false;
    return new Date(step.dueDate) < now;
  });
}
