const express = require('express');

const {
  list,
  insert,
  findById,
  update,
  deleteAssignment,
} = require('./todos');

const router = express.Router();

function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

async function listRoute(req, res) {
  const assignments = await list();

  return res.json(assignments);
}

async function postRoute(req, res) {
  const { title, due, position, completed } = req.body;
  const result = await insert(title, due, position, completed);

  if (!result.success && result.validation.length > 0) {
    return res.status(400).json(result.validation);
  }
  return res.status(200).json(result);
}

async function getRoute(req, res) {
  const { id } = req.params;

  const result = await findById(id);

  if (!result.success && result.notFound) {
    return res.status(404).json({ error: 'Assignment not found getRoute' });
  }

  if (!result.success && result.validation.length > 0) {
    return res.status(400).json(result.validation);
  }

  return res.status(200).json(result);
}

async function patchRoute(req, res) {
  const { id } = req.params;
  const { title, text } = req.body;

  const result = await update(id, { title, text });

  if (!result.success && result.notFound) {
    return res.status(404).json({ error: 'Assignment not found patchRoute' });
  }

  if (!result.success && result.validation.length > 0) {
    return res.status(400).json(result.validation);
  }

  return res.status(200).json(result.assignment);
}

async function deleteRoute(req, res) {
  const { id } = req.params;

  const result = await deleteAssignment(id);

  if (!result.success && result.notFound) {
    return res.status(404).json({ error: 'Assignment not found deleteRoute' });
  }

  if (!result.success && result.validation.length > 0) {
    return res.status(400).json({ error: 'Assignment doesnt exist deleteRoute' });
  }
  return res.status(200).json(result);
}


router.get('/', catchErrors(listRoute));
router.post('/', catchErrors(postRoute));
router.get('/:id', catchErrors(getRoute));
router.patch('/:id', catchErrors(patchRoute));
router.delete('/:id', catchErrors(deleteRoute));

module.exports = router;
