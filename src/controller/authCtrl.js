const JWT = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const User = require('../model/userModel')

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY

const authCtrl = {
  signUp: async (req, res) => {
    const {email} = req.body
    try {
      const existingUser = await User.findOne({email})
      if(existingUser) {
        return res.status(400).json({message: "This is email already exists!"})
      }

      const hashedPassword = await bcrypt.hash(req.body.password, 10)

      req.body.password = hashedPassword;

      if(req.body.role) {
        req.body.role = Number(req.body.role)
      }
      const user = new User(req.body)
      await user.save()

      const {password, ...otherDetails} = user._doc
      const token = JWT.sign(otherDetails, JWT_SECRET_KEY, {expiresIn: '2h'})

      res.status(201).json({message: 'Signup Success', user: otherDetails, token})
    } catch (error) {
      res.status(503).json({message: error.message})
    }
  },

  login: async (req, res) => {
    try {
      const {email} = req.body
      const existingUser = await User.findOne({email})
      if(!existingUser) {
        return res.status(404).json({message: "Invalid credentials!"})
      }
      const verifyPassword = await bcrypt.compare(req.body.password, existingUser.password)

      if(!verifyPassword) {
        return res.status(400).json({message: "Invalid credentials!"})
      }

      const {password, ...otherDetails} = existingUser._doc
      const token = JWT.sign(otherDetails, JWT_SECRET_KEY, {expiresIn: '2h'})

      res.status(200).json({message: 'Login Success', user: otherDetails, token})
    } catch (error) {
      res.status(503).json({message: error.message})
    }
  }
}


module.exports = authCtrl