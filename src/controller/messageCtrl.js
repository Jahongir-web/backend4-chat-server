const {v4} = require('uuid')

const path = require('path')
const fs = require('fs')

const Message = require('../model/messageModel')

const uploadsDir = path.join(__dirname, '../', 'public')

const messageCtlr = {
  // create new message
  addMessage: async (req, res) => {
    const {chatId, senderId} = req.body

    try {
      if(!chatId || !senderId) {
        return res.status(403).json({message: 'invalid credentials!'})
      }
      if(req.files) {
        const {image} = req.files
        const format = image.mimetype.split('/')[1]
        if(format !== 'png' && format !== 'jpeg') {
          return res.status(403).json({message: 'File format is incorrect!'})
        }
        const nameImg = `${v4()}.${format}`
        image.mv(path.join(uploadsDir, nameImg), (err) => {
          if(err) {
            res.status(503).json({message: err.message})
          }
        })

        req.body.file = nameImg
      }

      const message = new Message(req.body)
      await message.save()
      res.status(201).json({message: 'new message', message})
    } catch (error) {
      res.status(503).json({message: error.message})
    }
  },

  // get messages
  getMessages: async (req, res) => {
    const {chatId} = req.params
    try {
      const messages = await Message.find({chatId})
      res.status(200).json({message: "Chat's messages", messages})
    } catch (error) {
      res.status(503).json({message: error.message})
    }
  },

  // delete a message
  deleteMessage: async (req, res) => {
    const {messageId} = req.params
    try {
      const deletedMessage = await Message.findByIdAndDelete(messageId)      
      if(deletedMessage) {
        if(deletedMessage.file !== '') {
          await fs.unlink(path.join(uploadsDir, deletedMessage.file), (err) => {
            if(err) {
              res.status(503).json({message: err.message})
            }
          })
        }

        return res.status(200).json({message: 'Message deleted successfully!', deletedMessage})
      }
      res.status(404).json({message: 'Message not found!'})
    } catch (error) {
      res.status(503).json({message: error.message})
    }
  }
}

module.exports = messageCtlr