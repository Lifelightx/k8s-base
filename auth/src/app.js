const express = require('express')

const cors = require('cors')
const authRoutes = require('./routes/auth')
const errorHandler = require('./middlewares/errorHandler')
const app = express();

app.use(cors())
app.use(express.json())

app.get('/health', (req, res)=>{
    res.status(200).json({status:"ok", service:"auth"})
})

app.use('/api/auth', authRoutes)

app.use((req, res, next)=>{
    res.status(404).json({messge: 'Faaaaaaaaaaaaa'})
})

app.use(errorHandler)

module.exports = app