const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Todo = require('../models/Todo');
const logger = require('../utils/logger');
const protect = require('../middleware/protect');

router.use(protect);

// GET all projects for user
router.get('/', async (req, res, next) => {
  try {
    const projects = await Project.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    next(err);
  }
});

// POST create project
router.post('/', async (req, res, next) => {
  try {
    const { name, color } = req.body;
    const project = await Project.create({ name, color, userId: req.user.id });
    logger.info(`Project created: id=${project._id} name="${project.name}"`);
    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
});

// PUT update project
router.put('/:id', async (req, res, next) => {
  try {
    const { name, color } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (color !== undefined) updates.color = color;

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    next(err);
  }
});

// DELETE project
router.delete('/:id', async (req, res, next) => {
  try {
    // According to the BRD, we move todos to Inbox (projectId: null)
    await Todo.updateMany(
      { projectId: req.params.id, userId: req.user.id },
      { $set: { projectId: null } }
    );
    
    const project = await Project.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    logger.info(`Project deleted: id=${project._id}, todos moved to Inbox`);
    res.json({ message: 'Project deleted, todos moved to Inbox' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
