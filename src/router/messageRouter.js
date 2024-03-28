const express = require('express')

const router = express.Router()

const messageCtrl = require('../controller/messageCtrl')
const authMiddleware = require('../middleware/authMiddleware')


router.post('/', authMiddleware, messageCtrl.addMessage)
router.get('/:chatId', authMiddleware, messageCtrl.getMessages)
router.delete('/:messageId', authMiddleware, messageCtrl.deleteMessage)


module.exports = router;