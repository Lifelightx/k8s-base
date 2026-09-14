const request = require('supertest');
const express = require('express');

const todoRoutes = require('./todos');
const Todo = require('../models/Todo');
const { llmQueue } = require('../services/queue.service');

// 1. Mock dependencies
jest.mock('../models/Todo');
jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  error: jest.fn(),
}));
jest.mock('../services/queue.service', () => ({
  llmQueue: {
    add: jest.fn().mockResolvedValue()
  }
}));
jest.mock('../middleware/protect', () => (req, res, next) => {
  req.user = { id: 'fakeUserId' };
  next();
});

// 2. Set up isolated Express app for testing
const app = express();
app.use(express.json());
app.use('/api/todos', require('../middleware/protect'), todoRoutes);

// Error handler middleware to catch next(err) in tests
app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

describe('Todo Routes', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/todos', () => {
    it('should return a list of todos', async () => {
      const fakeTodos = [
        { _id: '1', text: 'Buy car', priority: 'high', description: 'test', completed: false, userId: 'fakeUserId' }
      ];
      Todo.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(fakeTodos)
      });
      
      const response = await request(app).get('/api/todos');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(fakeTodos);
      expect(Todo.find).toHaveBeenCalledWith({ userId: 'fakeUserId' });
    });
  });

  describe('GET /api/todos/stats', () => {
    it('should return todo statistics', async () => {
      // Mock Promise.all values: [total, completed, high, medium, low]
      Todo.countDocuments
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(4)  // completed
        .mockResolvedValueOnce(2)  // high
        .mockResolvedValueOnce(5)  // medium
        .mockResolvedValueOnce(3); // low

      const response = await request(app).get('/api/todos/stats');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        total: 10,
        completed: 4,
        active: 6,
        byPriority: { high: 2, medium: 5, low: 3 }
      });
    });
  });

  describe('POST /api/todos', () => {
    it('should create a new todo and queue background job', async () => {
      const newTodo = { _id: 'newId', text: 'New task', priority: 'high', description: '' };
      Todo.create.mockResolvedValue(newTodo);

      const response = await request(app)
        .post('/api/todos')
        .send({ text: 'New task', priority: 'high' });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(newTodo);
      expect(Todo.create).toHaveBeenCalledWith({
        text: 'New task',
        userId: 'fakeUserId',
        description: '',
        priority: 'high'
      });
      
      // Ensure the background queue job was added
      expect(llmQueue.add).toHaveBeenCalledWith('generate-desc', {
        todoId: 'newId',
        text: 'New task'
      }, expect.any(Object));
    });
  });

  describe('PATCH /api/todos/:id/toggle', () => {
    it('should toggle the completion status of a todo', async () => {
      const mockTodo = { 
        _id: '1', 
        completed: false, 
        userId: 'fakeUserId',
        save: jest.fn().mockResolvedValue(true)
      };
      Todo.findOne.mockResolvedValue(mockTodo);

      const response = await request(app).patch('/api/todos/1/toggle');

      expect(response.status).toBe(200);
      expect(mockTodo.completed).toBe(true);
      expect(mockTodo.save).toHaveBeenCalled();
    });

    it('should return 404 if todo not found', async () => {
      Todo.findOne.mockResolvedValue(null);
      const response = await request(app).patch('/api/todos/99/toggle');
      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/todos/:id', () => {
    it('should update a todo text and priority', async () => {
      const updatedTodo = { _id: '1', text: 'Updated task', priority: 'low' };
      Todo.findOneAndUpdate.mockResolvedValue(updatedTodo);

      const response = await request(app)
        .put('/api/todos/1')
        .send({ text: 'Updated task', priority: 'low' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedTodo);
      expect(Todo.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: '1', userId: 'fakeUserId' },
        { $set: { text: 'Updated task', priority: 'low' } },
        { new: true, runValidators: true }
      );
    });
  });

  describe('DELETE /api/todos/completed', () => {
    it('should delete all completed todos', async () => {
      Todo.deleteMany.mockResolvedValue({ deletedCount: 3 });

      const response = await request(app).delete('/api/todos/completed');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ deleted: 3 });
      expect(Todo.deleteMany).toHaveBeenCalledWith({ userId: 'fakeUserId', completed: true });
    });
  });

  describe('DELETE /api/todos/:id', () => {
    it('should delete a specific todo', async () => {
      Todo.findOneAndDelete.mockResolvedValue({ _id: '1' });

      const response = await request(app).delete('/api/todos/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Todo deleted' });
      expect(Todo.findOneAndDelete).toHaveBeenCalledWith({ _id: '1', userId: 'fakeUserId' });
    });

    it('should return 404 if todo to delete is not found', async () => {
      Todo.findOneAndDelete.mockResolvedValue(null);
      const response = await request(app).delete('/api/todos/99');
      expect(response.status).toBe(404);
    });
  });

});
