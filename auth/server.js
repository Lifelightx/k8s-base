require('dotenv').config();
const app = require('./src/app')
const connectDB = require('./src/config/db')
const logger = require('./src/logger')
const PORT = process.env.PORT

connectDB()

app.listen( PORT, "0.0.0.0", ()=>{
    logger.info(`The server running on http://localhost:${PORT}`)
})
