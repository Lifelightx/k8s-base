require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: process.env.ALLOW_ORIGIN || 'http://localhost:3000',
    credentials: true
}));

// Proxy routes for microservices
// Assuming standard naming convention for internal services or local ports
const SERVICES = {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:5002',
    backend: process.env.BACKEND_SERVICE_URL || 'http://localhost:5001',
    llm: process.env.LLM_SERVICE_URL || 'http://localhost:5003',
};

// Auth Service Proxy
app.use(createProxyMiddleware({
    target: SERVICES.auth,
    changeOrigin: true,
    pathFilter: "/api/auth"
}));

// Backend Service Proxy
app.use(createProxyMiddleware({
    target: SERVICES.backend,
    changeOrigin: true,
    pathFilter: "/api/todos"
}));

// LLM Service Proxy
app.use(createProxyMiddleware({
    target: SERVICES.llm,
    changeOrigin: true,
    pathFilter: "/api/ai"
}));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'Gateway is running' });
});

app.listen(PORT, () => {
    console.log(`Gateway service listening on port ${PORT}`);
});
