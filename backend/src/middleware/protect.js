const jwt = require('jsonwebtoken')


const protect = function(req,res,next){
    let token = req.cookies.token; // Try getting from cookie first

    // Fallback to Authorization header for testing or other clients
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token){
        return res.status(400).json({message: "Not authorized, no token provided"})
    }

    try {
         const decode = jwt.verify(token, process.env.JWT_SECRETE);
         req.user = decode;
         next()
        
    } catch (error) {
        return res.status(401).json({message: 'Not authorized, Invalid token'})
    }
   
}

module.exports = protect;