const express = require('express')

const router = express.Router()

const chatCtrl = require('../controller/chatCtrl')
const authMiddleware = require('../middleware/authMiddleware')


router.get('/', authMiddleware, chatCtrl.userChats)
router.get('/:firstId/:secondId', authMiddleware, chatCtrl.findChat)
router.delete('/:chatId', authMiddleware, chatCtrl.deleteChat)


module.exports = router;