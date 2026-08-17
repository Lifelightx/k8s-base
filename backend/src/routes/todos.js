const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');
const logger = require('../utils/logger');

// GET all todos (with optional filter/sort)
router.get('/', async (req, res, next) => {
  try {
    const { status, priority, sort = 'createdAt', order = 'desc' } = req.query;
    const query = {};
    if (status === 'active') query.completed = false;
    if (status === 'done') query.completed = true;
    if (priority) query.priority = priority;

    const sortDir = order === 'asc' ? 1 : -1;
    const todos = await Todo.find(query).sort({ [sort]: sortDir });
    logger.debug(`Fetched ${todos.length} todo(s)`);
    res.json(todos);
  } catch (err) {
    next(err);
  }
});

// GET stats
router.get('/stats', async (req, res, next) => {
  try {
    const [total, completed, high, medium, low] = await Promise.all([
      Todo.countDocuments(),
      Todo.countDocuments({ completed: true }),
      Todo.countDocuments({ priority: 'high' }),
      Todo.countDocuments({ priority: 'medium' }),
      Todo.countDocuments({ priority: 'low' }),
    ]);
    res.json({
      total,
      completed,
      active: total - completed,
      byPriority: { high, medium, low },
    });
  } catch (err) {
    next(err);
  }
});

// POST create todo
router.post('/', async (req, res, next) => {
  try {
    const { text, priority = 'medium' } = req.body;
    const todo = await Todo.create({ text, priority });
    logger.info(`Todo created: id=${todo._id} text="${todo.text}" priority=${todo.priority}`);
    res.status(201).json(todo);
  } catch (err) {
    next(err);
  }
});

// PATCH toggle completed
router.patch('/:id/toggle', async (req, res, next) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      logger.warn(`Todo not found for toggle: id=${req.params.id}`);
      return res.status(404).json({ message: 'Todo not found' });
    }
    todo.completed = !todo.completed;
    await todo.save();
    logger.info(`Todo toggled: id=${todo._id} completed=${todo.completed}`);
    res.json(todo);
  } catch (err) {
    next(err);
  }
});

// PUT update todo (text + priority)
router.put('/:id', async (req, res, next) => {
  try {
    const { text, priority } = req.body;
    const updates = {};
    if (text !== undefined) updates.text = text;
    if (priority !== undefined) updates.priority = priority;

    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!todo) {
      logger.warn(`Todo not found for update: id=${req.params.id}`);
      return res.status(404).json({ message: 'Todo not found' });
    }
    logger.info(`Todo updated: id=${todo._id}`);
    res.json(todo);
  } catch (err) {
    next(err);
  }
});

// DELETE todo
router.delete('/:id', async (req, res, next) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo) {
      logger.warn(`Todo not found for delete: id=${req.params.id}`);
      return res.status(404).json({ message: 'Todo not found' });
    }
    logger.info(`Todo deleted: id=${todo._id}`);
    res.json({ message: 'Todo deleted' });
  } catch (err) {
    next(err);
  }
});

// DELETE all completed
router.delete('/completed', async (req, res, next) => {
  try {
    const result = await Todo.deleteMany({ completed: true });
    logger.info(`Cleared ${result.deletedCount} completed todo(s)`);
    res.json({ deleted: result.deletedCount });
  } catch (err) {
    next(err);
  }
});

// Backwards-compat: PATCH /:id still toggles
router.patch('/:id', async (req, res, next) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ message: 'Todo not found' });
    todo.completed = !todo.completed;
    await todo.save();
    res.json(todo);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
