require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./src/config/db');
const todoRoutes = require('./src/routes/todos');
const errorHandler = require('./src/middleware/errorHandler');
const protect = require('./src/middleware/protect')
const logger = require('./src/utils/logger');
const crypto = require("crypto");
const os = require("os");
const axios = require('axios');
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

app.get("/api/crash", (req, res) => {
  console.log("Intentional crash request", {
    pod: os.hostname(),
  })

  console.log("CRASH REQUEST", {
    pod: os.hostname(),
    method: req.method,
    url: req.originalUrl,
    userAgent: req.headers["user-agent"],
    forwardedFor: req.headers["x-forwarded-for"],
  });

  res.status(200).json({
    message: "This pod will crash",
    pod: os.hostname()
  })

  setTimeout(()=>{
    process.exit(1);
  }, 100)
  
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
