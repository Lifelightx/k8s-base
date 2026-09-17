const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Todo text is required'],
      trim: true,
      maxlength: [200, 'Todo text cannot exceed 200 characters'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
      
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    description: {
      type: String,
      default: ""
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    dueDate: {
      type: Date,
      default: null,
      index: true
    },
    remindersEnabled: {
      type: Boolean,
      default: true
    },
    remindersSent: {
      type: [String], //e.g ['24h', '1h']
      default: []
    },
    tags: {
      type: [String],
      default: [],
      index: true
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
      index: true
    },
    subtasks: {
      type: [{
        title: { type: String, required: true },
        completed: { type: Boolean, default: false }
      }],
      default: []
    },
    recurrence: {
      type: String,
      enum: ['none', 'daily', 'weekly', 'monthly'],
      default: 'none',
    },
    nextDueDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Add compound text index for search functionality
todoSchema.index({ text: 'text', description: 'text' });

module.exports = mongoose.model('Todo', todoSchema);
