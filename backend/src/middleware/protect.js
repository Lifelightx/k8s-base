const jwt = require('jsonwebtoken')


const protect = function(req,res,next){
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(400).json({message: "Not authorized, no token provided"})

    }
    const token = authHeader.split(' ')[1];

    try {
         const decode = jwt.verify(token, process.env.JWT_SECRETE);
         req.user = decode;
         next()
        
    } catch (error) {
        return res.status(401).json({message: 'Not authorized, Invalid token'})
    }
   
}

module.exports = protect;