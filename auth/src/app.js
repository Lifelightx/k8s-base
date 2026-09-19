const express = require('express')

const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const errorHandler = require('./middlewares/errorHandler');
const logger = require('./logger');
const pinoHttp = require('pino-http')({ logger });
const promBundle = require("express-prom-bundle");
const metricsMiddleware = promBundle({includeMethod: true, includePath: true});

const app = express();
app.use(metricsMiddleware);
app.use(pinoHttp);

app.use(cors({
    origin: true, // or specific frontend URL in production
    credentials: true
}));
app.use(cookieParser());
app.use(express.json())

app.get('/api/health', (req, res)=>{
    res.status(200).json({status:"ok", service:"auth"})
})

app.use('/api/auth', authRoutes)

app.use((req, res, next)=>{
    res.status(404).json({messge: 'Faaaaaaaaaaaaa'})
})

app.use(errorHandler)

module.exports = app