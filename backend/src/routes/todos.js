const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');
const logger = require('../utils/logger');
const mongoose = require('mongoose');

const protect = require('../middleware/protect');
const { llmQueue } = require('../services/queue.service');

router.use(protect)
// GET all todos (with optional filter/sort)
router.get('/', async (req, res, next) => {
  try {
    const { status, priority, sort = 'createdAt', order = 'desc', tags, search, projectId } = req.query;
    const query = {};
    if (status === 'active') query.completed = false;
    if (status === 'done') query.completed = true;
    if (priority) query.priority = priority;
    if (tags) query.tags = { $in: tags.split(',') };
    if (projectId) query.projectId = projectId === 'inbox' ? null : projectId;
    
    if (search) {
      query.$text = { $search: search };
    }
    
    query.userId = req.user.id;

    const sortDir = order === 'asc' ? 1 : -1;
    
    // Sort by textScore if searching, otherwise sort by user preference
    const todos = await Todo.find(query)
      .sort(search ? { score: { $meta: 'textScore' } } : { [sort]: sortDir });
      
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
      Todo.countDocuments({ userId: req.user.id }),
      Todo.countDocuments({ userId: req.user.id, completed: true }),
      Todo.countDocuments({ userId: req.user.id, priority: 'high' }),
      Todo.countDocuments({ userId: req.user.id, priority: 'medium' }),
      Todo.countDocuments({ userId: req.user.id, priority: 'low' }),
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

// GET analytics data for dashboard
router.get('/analytics', async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const data = await Todo.aggregate([
      { 
        $match: { 
          userId: new mongoose.Types.ObjectId(req.user.id), 
          completedAt: { $gte: since } 
        } 
      },
      { 
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// POST create todo
router.post('/', async (req, res, next) => {
  try {
    const { text, priority = 'medium', dueDate, remindersEnabled, tags = [], projectId = null, recurrence = 'none' } = req.body;
    const userId = req.user.id

    //create todo immediately without the description
    const todo = await Todo.create({ text, userId, description: "", priority, dueDate, remindersEnabled, tags, projectId, recurrence });
    logger.info(`Todo created: id=${todo._id} text="${todo.text}" priority=${todo.priority}`);

    // Add a background job to fetch the description
    // BullMQ will handle retries automatically if the LLM service is down

    await llmQueue.add('generate-desc', {
      todoId: todo._id,
      text: todo.text
    }, {
      attempts: 10, // Retry upto 10 times
      backoff: {
        type: 'exponential',
        delay: 5000 // wait 5s, then 10, then 20
      }
    })

    res.status(201).json(todo);
  } catch (err) {
    next(err);
  }
});

// PATCH toggle completed
router.patch('/:id/toggle', async (req, res, next) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, userId: req.user.id });
    if (!todo) {
      logger.warn(`Todo not found for toggle: id=${req.params.id}`);
      return res.status(404).json({ message: 'Todo not found' });
    }
    todo.completed = !todo.completed;
    todo.completedAt = todo.completed ? new Date() : null;
    await todo.save();
    
    // Recurrence logic: spawn next task
    if (todo.completed && todo.recurrence && todo.recurrence !== 'none' && todo.dueDate) {
      const nextDate = new Date(todo.dueDate);
      if (todo.recurrence === 'daily') nextDate.setDate(nextDate.getDate() + 1);
      if (todo.recurrence === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
      if (todo.recurrence === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
      
      await Todo.create({
        text: todo.text,
        userId: todo.userId,
        priority: todo.priority,
        tags: todo.tags,
        dueDate: nextDate,
        recurrence: todo.recurrence,
        remindersEnabled: todo.remindersEnabled,
        projectId: todo.projectId,
        description: todo.description
      });
      logger.info(`Recurrent todo spawned for: id=${todo._id}`);
    }

    logger.info(`Todo toggled: id=${todo._id} completed=${todo.completed}`);
    res.json(todo);
  } catch (err) {
    next(err);
  }
});

// PUT update todo
router.put('/:id', async (req, res, next) => {
  try {
    const { text, priority, dueDate, remindersEnabled, tags, projectId, subtasks, recurrence } = req.body;
    const updates = {};
    if (text !== undefined) updates.text = text;
    if (priority !== undefined) updates.priority = priority;
    if (dueDate !== undefined) updates.dueDate = dueDate;
    if (remindersEnabled !== undefined) updates.remindersEnabled = remindersEnabled;
    if (tags !== undefined) updates.tags = tags;
    if (projectId !== undefined) updates.projectId = projectId;
    if (subtasks !== undefined) updates.subtasks = subtasks;
    if (recurrence !== undefined) updates.recurrence = recurrence;

    const todo = await Todo.findOneAndUpdate({
      _id: req.params.id, userId: req.user.id
    },
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

// DELETE all completed
router.delete('/completed', async (req, res, next) => {
  try {
    const result = await Todo.deleteMany({ userId: req.user.id, completed: true });
    logger.info(`Cleared ${result.deletedCount} completed todo(s)`);
    res.json({ deleted: result.deletedCount });
  } catch (err) {
    next(err);
  }
});

// PATCH apply bulk priority suggestions
router.patch('/bulk-priority', async (req, res, next) => {
  try {
    // req.body = [{ id, priority }]
    const ops = req.body.map(({ id, priority }) => ({
      updateOne: { filter: { _id: id, userId: req.user.id }, update: { $set: { priority } } }
    }));
    
    if (ops.length > 0) {
      await Todo.bulkWrite(ops);
    }
    logger.info(`User ${req.user.id} bulk updated priority for ${ops.length} tasks`);
    res.json({ updated: ops.length });
  } catch (err) {
    next(err);
  }
});

// DELETE todo
router.delete('/:id', async (req, res, next) => {
  try {
    const todo = await Todo.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
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

// GET distinct tags
router.get('/tags', async (req, res, next) => {
  try {
    const tags = await Todo.distinct('tags', { userId: req.user.id });
    res.json(tags || []);
  } catch (err) {
    next(err);
  }
});

// Backwards-compat: PATCH /:id still toggles
router.patch('/:id', async (req, res, next) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, userId: req.user.id });
    if (!todo) return res.status(404).json({ message: 'Todo not found' });
    todo.completed = !todo.completed;
    todo.completedAt = todo.completed ? new Date() : null;
    await todo.save();
    res.json(todo);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
