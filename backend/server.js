require('dotenv').config();
require('./src/services/queue.service');
const { initQueueWorker } =  require('./src/services/queue.service');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const pinoHttp = require('pino-http');
const promBundle = require("express-prom-bundle");
const metricsMiddleware = promBundle({includeMethod: true, includePath: true});
const connectDB = require('./src/config/db');
const todoRoutes = require('./src/routes/todos');
const errorHandler = require('./src/middleware/errorHandler');
const http = require('http');
const { Server } = require('socket.io');
const logger = require('./src/utils/logger');
const crypto = require("crypto");
const os = require("os");
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// HTTP request logger (morgan → custom logger)


// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());

//initializing socket.io

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(pinoHttp({ logger }));
app.use(metricsMiddleware);

// Routes
app.use('/api/todos', todoRoutes);
const projectRoutes = require('./src/routes/projects');
app.use('/api/projects', projectRoutes);

// Health check


app.get("/api/crash", (req, res) => {
  logger.info({
    pod: os.hostname(),
  }, "Intentional crash request")

  logger.info({
    pod: os.hostname(),
    method: req.method,
    url: req.originalUrl,
    userAgent: req.headers["user-agent"],
    forwardedFor: req.headers["x-forwarded-for"],
  }, "CRASH REQUEST");

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

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
// We attach io to the app so we can use it inside our worker/routes
app.set('io', io)
io.on('connection', (socket)=>{
  logger.info(`New client connected: ${socket.id}`)
  
  socket.on('join', (userId) => {
    socket.join(userId);
    logger.info(`Socket ${socket.id} joined room: ${userId}`);
  });

  socket.on('disconnect', ()=>{
    logger.info(`Client disconnected: ${socket.id}`)
  })
})

initQueueWorker(io);

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
