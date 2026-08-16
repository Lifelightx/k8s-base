const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');
const logger = require('../utils/logger');

// GET all todos
router.get('/', async (req, res, next) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    logger.debug(`Fetched ${todos.length} todo(s)`);
    res.json(todos);
  } catch (err) {
    next(err);
  }
});

// POST create todo
router.post('/', async (req, res, next) => {
  try {
    const todo = await Todo.create({ text: req.body.text });
    logger.info(`Todo created: id=${todo._id} text="${todo.text}"`);
    res.status(201).json(todo);
  } catch (err) {
    next(err);
  }
});

// PATCH toggle completed
router.patch('/:id', async (req, res, next) => {
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

module.exports = router;
