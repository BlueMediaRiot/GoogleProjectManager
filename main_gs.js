/**
 * Main.gs - Bootstrap and routing for Video Project Manager
 * Entry point for all triggers and actions
 */

/**
 * Homepage trigger - required by add-on manifest
 * @param {Object} e - Event object
 * @return {Card[]} Array of cards
 */
function onHomepage(e) {
  try {
    Storage.ensureSeed_();
    const projects = Storage.getProjects();
    
    if (projects.length === 0) {
      return [buildWelcomeCard_()];
    }
    
    // Default to first project or last viewed
    const projectId = PropertiesService.getUserProperties().getProperty('lastViewedProject') || projects[0].id;
    return [buildOverviewCard_(projectId)];
  } catch (error) {
    Logger.log('onHomepage error: ' + error.toString());
    return [buildErrorCard_(error.toString())];
  }
}

/**
 * Gmail contextual trigger
 * @param {Object} e - Event object with Gmail context
 * @return {Card[]} Array of cards
 */
function onGmailContext(e) {
  try {
    Storage.ensureSeed_();
    const projects = Storage.getProjects();
    
    if (projects.length === 0) {
      return [buildWelcomeCard_()];
    }
    
    return [buildGmailLinkCard_(e)];
  } catch (error) {
    Logger.log('onGmailContext error: ' + error.toString());
    return [buildErrorCard_(error.toString())];
  }
}

/**
 * Settings universal action
 * @param {Object} e - Event object
 * @return {Card} Settings card
 */
function onSettingsAction(e) {
  try {
    const card = buildSettingsCard_();
    return CardService.newActionResponseBuilder()
      .setNavigation(CardService.newNavigation().pushCard(card))
      .build();
  } catch (error) {
    Logger.log('onSettingsAction error: ' + error.toString());
    return buildErrorResponse_(error.toString());
  }
}

/**
 * Build welcome card for first-time users
 * @return {Card} Welcome card
 */
function buildWelcomeCard_() {
  const card = CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader()
      .setTitle('Welcome to Video Project Manager')
      .setImageUrl('https://www.gstatic.com/images/branding/product/1x/apps_script_48dp.png'))
    .addSection(CardService.newCardSection()
      .addWidget(CardService.newTextParagraph()
        .setText('Get started by creating your first video project. Track development, pre-production, production, post-production, and delivery phases all in one place.'))
      .addWidget(CardService.newButtonSet()
        .addButton(CardService.newTextButton()
          .setText('Create First Project')
          .setOnClickAction(CardService.newAction()
            .setFunctionName('actionCreateProject_'))
          .setTextButtonStyle(CardService.TextButtonStyle.FILLED))));
  
  return card.build();
}

/**
 * Build error card
 * @param {string} message - Error message
 * @return {Card} Error card
 */
function buildErrorCard_(message) {
  const card = CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader()
      .setTitle('Error'))
    .addSection(CardService.newCardSection()
      .addWidget(CardService.newTextParagraph()
        .setText('An error occurred: ' + message))
      .addWidget(CardService.newButtonSet()
        .addButton(CardService.newTextButton()
          .setText('Go to Homepage')
          .setOnClickAction(CardService.newAction()
            .setFunctionName('onHomepage')))));
  
  return card.build();
}

/**
 * Build error response for actions
 * @param {string} message - Error message
 * @return {ActionResponse} Error response
 */
function buildErrorResponse_(message) {
  return CardService.newActionResponseBuilder()
    .setNotification(CardService.newNotification()
      .setText('Error: ' + message)
      .setType(CardService.NotificationType.ERROR))
    .build();
}
