const xss = require('xss');
const validator = require('validator');
const { query } = require('./db');

async function list() {
  const result = await query('SELECT * FROM ASSIGNMENTS');

  return result.rows;
}

function isEmpty(s) {
  return s == null && !s;
}

/**
 * Validates 'title', 'due', 'position' and 'completed' of the assignment so it can be inserted
 * @param {string} title Title of assignment
 * @param {date} due Duedate of assignment
 * @param {int} position Position of the assignment
 * @param {boolean} completed Indicates if the assignment is completed or not
 */
function validate(title, due, position, completed) {
  const errors = [];

  if (!isEmpty(title)) {
    if (typeof title !== 'string' || title.length === 0 || title.length > 128) {
      errors.push({
        field: 'title',
        error: 'Titill verður að vera strengur sem er 1 til 128 stafir',
      });
    }
  }

  if (!isEmpty(due)) {
    if (validator.isISO8601(due)) {
      errors.push({
        field: 'due',
        error: 'Dagsetning verður að vera gild ISO 8601 dagsetning',
      });
    }
  }

  if (!isEmpty(position)) {
    const posInt = parseInt(position, 10);
    if (typeof posInt === 'string' || posInt < 0) {
      errors.push({
        field: 'position',
        error: 'Staðsetning verður að vera heiltala stærri eða jöfn 0',
      });
    }
  }

  if (typeof completed !== 'boolean') {
    errors.push({
      field: 'completed',
      error: 'Lokið verður að vera boolean gildi',
    });
  }

  return errors;
}

/**
 * Inserts new assignment
 * @param {string} title Title of the new assignment
 * @param {date} due Due date of new assignment
 * @param {int} position Position of the new assignment
 * @param {boolean} completed Indicates if the new assignment is completed or not
 */
async function insert(title, due, position, completed) {
  const validationResult = await validate(title, due, position, completed);

  if (validationResult.length > 0) {
    return {
      success: false,
      notFound: false,
      validation: validationResult,
    };
  }

  const xssValues = [xss(title), xss(due), xss(position), xss(completed)];

  const assignment = await query(`
  INSERT INTO verkefni
  (title, position, due, completed)
  VALUES ($1, $2, $3, $4)
  RETURNING id, title, position, due, created, updated, completed`, xssValues);

  return {
    success: true,
    assignment: assignment.rows,
  };
}

/**
 * Finds an assignment by its id
 * @param {int} id Id of assignment to find
 * @returns {object}
 */
async function findById(id) {
  const result = await query('SELECT * FROM assignments WHERE id = $1', [id]);
  return result.rows;
}

/**
 * Updates an assignment, either its title, text or both.
 *
 * @param {number} id Id of assignment to update
 * @param {object} assignment Assignment to update
 * @returns {object}
 */
async function update(id, assignment) {
  const result = await query('SELECT * FROM ASSIGNMENTS where id = $1', [id]);

  if (result.rows.length === 0) {
    return {
      success: false,
      notFound: true,
      validation: [],
    };
  }

  const validationResult = validate(
    assignment.title,
    assignment.due,
    assignment.position,
    assignment.completed,
  );

  if (validationResult.length > 0) {
    return {
      success: false,
      notFound: false,
      validation: validationResult,
    };
  }

  const changedColumns = [
    !isEmpty(assignment.title) ? 'title' : null,
    !isEmpty(assignment.due) ? 'due' : null,
    !isEmpty(assignment.position) ? 'position' : null,
    !isEmpty(assignment.completed) ? 'completed' : null,
  ].filter(Boolean);

  const changedValues = [
    !isEmpty(assignment.title) ? xss(assignment.title) : null,
    !isEmpty(assignment.due) ? xss(assignment.due) : null,
    !isEmpty(assignment.position) ? xss(assignment.position) : null,
    !isEmpty(assignment.completed) ? xss(assignment.completed) : null,
  ].filter(Boolean);


  const updates = [id, ...changedValues];

  const updatedColumnsQuery = changedColumns.map((column, i) => `${column} = $${i + 2}`);

  console.log(updates); // eslint-disable-line
  console.log(updatedColumnsQuery); // eslint-disable-line

  const q = `
    UPDATE assignments
    SET ${updatedColumnsQuery.join(', ')}
    WHERE id = $1
    RETURNING id, title`;
  console.log(q); // eslint-disable-line

  const updateResult = await query(q, updates);
  console.log(updateResult); // eslint-disable-line
  return {
    success: true,
    assignment: updateResult.rows[0],
  };
}

/**
 * Deletes an assignment
 * @param {int} id Id of assignment
 */
async function deleteAssignment(id) {
  if (typeof id !== 'number') {
    return {
      success: false,
      notFound: true,
      validation: [],
    };
  }
  const result = await query('DELETE * FROM assignments WHERE id = $1', [id]);
  return result.rows;
}

module.exports = {
  list,
  insert,
  findById,
  update,
  deleteAssignment,
};
