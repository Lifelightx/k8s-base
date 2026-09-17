require('dotenv').config();
const express = require('express');
const http = require('http');
const axios = require('axios')
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { createClient } = require('redis');
const { rateLimit } = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');


//create redis client 
const redisClient = createClient({
    url: process.env.REDIS_URL
});

redisClient.on('error', (err)=> console.error('Redis client error: ', err));
redisClient.connect().then(()=> console.log('Gateway connected to Redis for rate limiting'))

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true, //Return rate limit info in the 'RateLimit-*' headers
    legacyHeaders: false, //Disable the 'X-Ratelimit-*' headers
    store: new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args)
    }),
    message: { error: 'Too many requests from this IP, please try again after 15 minutes.'}
})
const app = express();
const PORT = process.env.PORT || 5000;
app.use(globalLimiter)
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
    pathFilter: ["/api/todos", "/api/projects"]
}));

// Socket.io WebSocket Proxy – stored in variable for upgrade wiring
const socketProxy = createProxyMiddleware({
    target: SERVICES.backend,
    changeOrigin: true,
    ws: true,
    pathFilter: "/socket.io"
});
app.use(socketProxy);

// LLM Service Proxy
app.use(createProxyMiddleware({
    target: SERVICES.llm,
    changeOrigin: true,
    pathFilter: "/api/ai"
}));

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try{
        const [authHealth, backendHealth, llmHealth ] = await Promise.allSettled([
            axios.get(`${SERVICES.auth}/api/health`),
            axios.get(`${SERVICES.backend}/api/health`),
            axios.get(`${SERVICES.llm}/api/ai/health`)
        ])

        const isHealthy = (result) => result.status === 'fulfilled' && result.value.status === 200;
        const healthStatus = {
            gateway: 'ok',
            auth: isHealthy(authHealth) ? 'ok' : 'down',
            backend: isHealthy(backendHealth) ? 'ok' : 'down',
            llm: isHealthy(llmHealth) ? 'ok' : 'down'
        }
        const overallStatus = Object.values(healthStatus).includes('down') ? 503 : 200;
        res.status(overallStatus).json(healthStatus)
    }catch(error){
        res.status(500).json({ status: 'Gateway error' });
    }
});

const server = http.createServer(app);

// Manually handle WebSocket upgrade (required for http-proxy-middleware v4)
server.on('upgrade', (req, socket, head) => {
    socketProxy.upgrade(req, socket, head);
});

server.listen(PORT, () => {
    console.log(`Gateway service listening on port ${PORT}`);
});
