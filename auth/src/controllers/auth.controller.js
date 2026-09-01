const User = require('../models/user.model')
const jwt = require('jsonwebtoken')


const generateToken = function (userID) {
    const payload = {
        id: userID
    }
    return jwt.sign(payload, process.env.JWT_SECRETE, {
        expiresIn: '1d'
    })
}


const registerUser = async (req, res) => {
    try {


        const { email, name, profession, age, password } = req.body;
        const userExists = await User.findOne({ email })
        if (userExists) {
            return res.status(400).json({
                message: "User already exists"
            })
        }

        const user = await User.create({
            email,
            name,
            profession,
            password,
            age
        })

        if (user) {
            res.status(201).json({
                _id: user._id,
                email: user.email,
                token: generateToken(user._id)
            })
        }
        else {
            res.status(400).json({ message: 'Invalid user data' })
        }
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ "message": 'Failed to create user', "error": error.message })
    }
}



const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email })

        if (user && (await user.matchPassword(password))) {
            res.status(200).json({
                userId: user._id,
                token: generateToken(user._id)
            })
        } else {
            res.status(400).json({ message: 'Invalid credentials' })
        }
    } catch (error) {
        res.status(500).json({ "message": "Faild to login", "error": error.message })
    }

}

module.exports = { registerUser, loginUser}