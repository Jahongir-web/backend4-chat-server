const express = require('express')

const router = express.Router()

const userCtrl = require('../controller/userCtrl')
const authMiddleware = require('../middleware/authMiddleware')


router.get('/', userCtrl.getAllUsers)
router.get('/:id', userCtrl.getUser)
router.put('/:id', authMiddleware, userCtrl.updateUser)
router.delete('/:id', authMiddleware, userCtrl.deleteUser)


module.exports = router;