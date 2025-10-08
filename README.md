# GoogleProjectManager

always double cross everything with the SDK - https://developers.google.com/apps-script

1) Goal

Build a Google Workspace Add-on (Apps Script) that manages multiple video projects using CardService UI. It should mirror the columns and items shown in my screenshots:

Development, Pre-Production, Production, Post-Production, Delivery

Each column contains steps/cards like Storyboard, Brief, Producer, Director, Line Producer, Crew, Casting, Location, Shot List, Shooting Schedule, Shooting Day(s), First Rough Cut, First Correction, Second Correction, Picture Lock, Rights Ownership, Deliverables

Left nav sections: Overview, Documents, Tasks, Calendar, Shared Links, Settings; Creation: Storyboards; Resources: Locations, Characters

The add-on must work from Gmail and the Workspace sidebar (Editor add-on surfaces are fine), store data, and integrate with Google APIs for Calendar, Drive, and (optionally) Sheets.

2) Authoritative references (follow them, do not freelance)

Workspace Add-ons docs: https://developers.google.com/workspace/add-ons

Use only supported manifest fields. No imaginary keys like addOns.common.layout.

UI must be built with CardService (Cards, Sections, Widgets, Action, Navigation).

Use Apps Script advanced services or REST with OAuth scopes from the docs.

Validate all scopes and trigger config exactly as documented.

3) Deliverables

Apps Script project with these files:

appsscript.json (valid, v1 schema)

Main.gs (bootstrap, routing, onHomepage)

Views/*.gs (card builders per view/column)

Models/*.gs (Project, Step, Resource)

Services/Storage.gs (Sheets or Firestore via REST; default to Sheets)

Services/Calendar.gs (Calendar integration)

Services/Drive.gs (file pickers and links)

Services/Auth.gs (scopes, safe calls)

Utils/Ui.gs (formatting, icons, common widgets)

Data sheet template (if using Sheets storage): one spreadsheet auto-created on first run with tabs:

Projects, Steps, People, Locations, Characters, Links, Settings

README.md with deploy steps, scopes, and test cases.

QA checklist and manual test script.

Sample icon (96×96) and logo URL in manifest.

4) Functional scope
4.1 Project model

Project: id, title, status, priority, startDate, dueDate, producerId, directorId, lineProducerId

Step: id, projectId, phase {Development|Pre-Production|Production|Post-Production|Delivery}, name, dueDate, assigneeIds[], status {Open|In Progress|Done}, notes, linkedCalendarEventId, linkedDriveFileIds[]

Resource: Person {id, name, email, role}, Location {id, name, address, notes}, Character {id, name, notes}

Link: id, projectId, title, driveFileId or URL, type {Doc|Sheet|Slide|PDF|External}

4.2 Core features

Overview card: project header, progress (steps completed / total), producer/director/line producer pickers, priority chip, set dates.

Kanban-style phases: five columns rendered as sections; each step is a widget with:

Checkbox (status), assignees, due date, people picker action, open/edit actions.

Calendar integration:

“Add shooting day” creates Calendar event; display upcoming events in a mini list.

Documents / Shared Links:

Attach Drive files via Drive Picker; show chips with open actions.

Tasks: filtered list of steps assigned to me with due dates.

Settings: choose storage (Sheets default), default project template, icon theme.

Storyboards / Locations / Characters: simple CRUD and attach to project.

Search: text query to filter projects/steps.

4.3 Actions

CreateProject, EditProject, DeleteProject

AddStep, EditStep, MarkDone, AssignPeople, SetDueDate

AddShootingDay (Calendar event), AttachDriveFile, OpenFile, CreateFromTemplate (Docs/Sheets/Slides)

5) Storage

Default: Google Sheets created on first run in the user’s Drive. Provide a thin DAL:

Notes:

layoutProperties is valid; do not invent fields like addOns.common.layout.

onHomepage must exist and return a Card[] via CardService.newNavigation().updateCard(...) or return [card].

7) UI: CardService rules

Each phase is a CardSection; each step is a KeyValue or DecoratedText with:

icon, title, subtitle (due date + assignees), switch/checkbox for status, and overflow menu.

Top of Overview: Header with project image, chips for Producer/Director/Line Producer (Person pickers via TextInput + chooser dialog card).

“Add shooting day” opens a DateTime picker; on submit, creates Calendar event, stores eventId, and refreshes.

8) Required functions (minimum)

onHomepage(e)

buildOverviewCard_(projectId?)

buildPhaseCard_(projectId, phase)

actionCreateProject_(e), actionEditProject_(e), actionDeleteProject_(e)

actionAddStep_(e), actionToggleStep_(e), actionAssignPeople_(e)

actionAddShootingDay_(e) → Calendar insert

actionAttachDriveFile_(e) → Drive picker

onGmailContext(e) → show “link email to project” quick action

Storage helpers: Storage.ensureSeed_(), CRUD methods

Return values must be Card or ActionResponse per the docs.

9) Drive & Calendar integration

Use DriveApp for file creation and DrivePicker via OpenLink or Action with url to the picker web flow.

Use CalendarApp or Calendar Advanced Service for events:

Title pattern: [Project] Shooting Day #N

Store eventId on the step record; support open/edit actions.

10) Error handling & UX

Wrap external calls with try/catch. Show CardService.newNotification().setText("...") on errors.

Disable destructive actions until confirmed with a FixedFooter OK/Cancel.

Use loading spinners with setOnClickAction + loadIndicator.

11) Testing & validation (do this at the end, twice)

Schema check 1: Compare appsscript.json against the Add-ons manifest reference. Remove any unknown fields.
Docs: https://developers.google.com/workspace/add-ons/concepts/manifest

Runtime check 1: Run onHomepage from the editor. Fix any CardService misuse.

Scopes check: Ensure every service call is covered by a declared scope.

Deployment: Test as latest deployment in Gmail and one Editor surface.

Schema check 2: Re-read the same manifest page, verify homepageTrigger, universalActions, and the gmail.contextualTriggers sections match examples.

Runtime check 2: Click through all actions (create/edit project, add step, attach Drive, add shooting day). Confirm cards update with Navigation.pushCard/updateCard.

12) Acceptance criteria

The project opens with an Overview card listing five phases and step counts.

New project wizard works; default template seeds all steps shown in my screenshots.

Steps can be marked done and visibly update progress.

“Add shooting day” creates a Calendar event and shows it under Production.

Drive files can be linked and opened from the card.

No manifest or syntax errors. No unknown manifest fields. onHomepage authorizes and renders.

13) Coding conventions

Apps Script V8. Use const/let, arrow functions only where allowed.

Centralize UI constants (colors, icons, labels).

Keep all Card builders pure; actions mutate storage then return Navigation.updateCard.

15) Deployment steps (ChatGPT must include in README)

Create new Apps Script project > paste code > set manifest > enable advanced services if used.

Deploy > Test deployments > Install > Open in Gmail sidebar and run onHomepage.

Provide troubleshooting notes for common errors:

“Invalid manifest: unknown fields” → you used fields not in the doc. Remove them.

“Attempted to execute myFunction, but could not save” → fix manifest/compile errors first.

“Syntax error: Missing ; before statement” → run editor linter and fix.
