require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./src/config/db');
const todoRoutes = require('./src/routes/todos');
const errorHandler = require('./src/middleware/errorHandler');
const logger = require('./src/utils/logger');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// HTTP request logger (morgan → custom logger)
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms', {
    stream: { write: (msg) => logger.info(msg.trim()) },
  })
);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/todos', todoRoutes);

// Health check
app.get('/api/health', (req, res) => {
  logger.debug('Health check hit');
  res.json({ status: 'ok' });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
