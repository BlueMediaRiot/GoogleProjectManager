/**
 * Models/Resource.gs - Resource models (Person, Location, Character, Link)
 */

/**
 * Create a new person
 * @param {Object} data - Person data
 * @return {Object} Created person
 */
function createPerson_(data) {
  const person = {
    id: generateId_(),
    name: data.name || '',
    email: data.email || '',
    role: data.role || '',
    createdAt: new Date().toISOString()
  };
  
  Storage.savePerson(person);
  return person;
}

/**
 * Update existing person
 * @param {string} personId - Person ID
 * @param {Object} data - Updated data
 * @return {Object} Updated person
 */
function updatePerson_(personId, data) {
  const person = Storage.getPerson(personId);
  if (!person) throw new Error('Person not found');
  
  const updated = {
    ...person,
    ...data,
    id: personId
  };
  
  Storage.savePerson(updated);
  return updated;
}

/**
 * Delete person
 * @param {string} personId - Person ID
 */
function deletePerson_(personId) {
  Storage.deletePerson(personId);
}

/**
 * Find or create person by email
 * @param {string} email - Email address
 * @param {string} name - Optional name
 * @return {Object} Person object
 */
function findOrCreatePerson_(email, name) {
  const people = Storage.getPeople();
  let person = people.find(p => p.email === email);
  
  if (!person) {
    person = createPerson_({ email: email, name: name || email });
  }
  
  return person;
}