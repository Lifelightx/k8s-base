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
    description: {
      type: String,
      default: ""
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Todo', todoSchema);
