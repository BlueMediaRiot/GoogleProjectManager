/**
 * Models/Project.gs - Project data model and business logic
 */

/**
 * Create a new project with default structure
 * @param {Object} data - Project data
 * @return {Object} Created project
 */
function createProject_(data) {
  const project = {
    id: generateId_(),
    title: data.title || 'New Video Project',
    status: data.status || 'Open',
    priority: data.priority || 'Medium',
    startDate: data.startDate || null,
    dueDate: data.dueDate || null,
    producerId: data.producerId || null,
    directorId: data.directorId || null,
    lineProducerId: data.lineProducerId || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  Storage.saveProject(project);
  
  // Create default steps for all phases
  UI.PHASES.forEach(phase => {
    const stepNames = UI.DEFAULT_STEPS[phase] || [];
    stepNames.forEach(name => {
      createStep_({
        projectId: project.id,
        phase: phase,
        name: name,
        status: 'Open'
      });
    });
  });
  
  return project;
}

/**
 * Update existing project
 * @param {string} projectId - Project ID
 * @param {Object} data - Updated data
 * @return {Object} Updated project
 */
function updateProject_(projectId, data) {
  const project = Storage.getProject(projectId);
  if (!project) throw new Error('Project not found');
  
  const updated = {
    ...project,
    ...data,
    id: projectId,
    updatedAt: new Date().toISOString()
  };
  
  Storage.saveProject(updated);
  return updated;
}

/**
 * Delete project and all related data
 * @param {string} projectId - Project ID
 */
function deleteProject_(projectId) {
  // Delete all steps
  const steps = Storage.getSteps(projectId);
  steps.forEach(step => {
    // Delete associated calendar events
    if (step.linkedCalendarEventId) {
      try {
        CalendarApp.getDefaultCalendar().getEventById(step.linkedCalendarEventId).deleteEvent();
      } catch (e) {
        Logger.log('Error deleting calendar event: ' + e.toString());
      }
    }
  });
  
  // Delete all links
  const links = Storage.getLinks(projectId);
  
  // Delete project
  Storage.deleteProject(projectId);
  
  // Delete all steps from storage
  steps.forEach(step => Storage.deleteStep(step.id));
  
  // Delete all links from storage
  links.forEach(link => Storage.deleteLink(link.id));
}

/**
 * Get project statistics
 * @param {string} projectId - Project ID
 * @return {Object} Statistics object
 */
function getProjectStats_(projectId) {
  const steps = Storage.getSteps(projectId);
  
  const stats = {
    total: steps.length,
    open: 0,
    inProgress: 0,
    done: 0,
    byPhase: {}
  };
  
  UI.PHASES.forEach(phase => {
    stats.byPhase[phase] = {
      total: 0,
      done: 0
    };
  });
  
  steps.forEach(step => {
    if (step.status === 'Open') stats.open++;
    else if (step.status === 'In Progress') stats.inProgress++;
    else if (step.status === 'Done') stats.done++;
    
    if (stats.byPhase[step.phase]) {
      stats.byPhase[step.phase].total++;
      if (step.status === 'Done') {
        stats.byPhase[step.phase].done++;
      }
    }
  });
  
  stats.percentComplete = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
  
  return stats;
}

/**
 * Get project team members
 * @param {string} projectId - Project ID
 * @return {Array} Array of person objects
 */
function getProjectTeam_(projectId) {
  const project = Storage.getProject(projectId);
  if (!project) return [];
  
  const team = [];
  const people = Storage.getPeople();
  
  if (project.producerId) {
    const producer = people.find(p => p.id === project.producerId);
    if (producer) team.push({...producer, role: 'Producer'});
  }
  
  if (project.directorId) {
    const director = people.find(p => p.id === project.directorId);
    if (director) team.push({...director, role: 'Director'});
  }
  
  if (project.lineProducerId) {
    const lineProducer = people.find(p => p.id === project.lineProducerId);
    if (lineProducer) team.push({...lineProducer, role: 'Line Producer'});
  }
  
  return team;
}

/**
 * Get upcoming shooting days for project
 * @param {string} projectId - Project ID
 * @return {Array} Array of event objects
 */
function getUpcomingShootingDays_(projectId) {
  const steps = Storage.getSteps(projectId).filter(s => s.linkedCalendarEventId);
  const events = [];
  
  steps.forEach(step => {
    try {
      const event = CalendarApp.getDefaultCalendar().getEventById(step.linkedCalendarEventId);
      if (event) {
        const startTime = event.getStartTime();
        if (startTime >= new Date()) {
          events.push({
            id: step.linkedCalendarEventId,
            stepId: step.id,
            title: event.getTitle(),
            startTime: startTime,
            endTime: event.getEndTime()
          });
        }
      }
    } catch (e) {
      Logger.log('Error fetching calendar event: ' + e.toString());
    }
  });
  
  events.sort((a, b) => a.startTime - b.startTime);
  return events;
}
