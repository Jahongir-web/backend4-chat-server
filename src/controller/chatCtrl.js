const Chat = require('../model/chatModel')

const chatCtrl = {
  // chat list
  userChats: async (req, res) => {
    const {_id} = req.user
    try {
      const chats = await Chat.find({members: {$in: [_id]}})
      res.status(200).json({message: 'user chats', chats})
    } catch (error) {
      res.status(503).json({message: error.message})
    }
  },

  // find chat or create
  findChat: async (req, res) => {
    const {firstId, secondId} = req.params
    try {
      const chat = await Chat.findOne({members: {$all: [firstId, secondId]}})

      if(chat) {
        return res.status(200).json({message: 'found chat', chat})
      }

      const newChat = await Chat({members: [firstId, secondId]})
      await newChat.save()
      return res.status(201).json({message: 'found chat', chat: newChat}) 
    } catch (error) {
      res.status(503).json({message: error.message})
    }
  },

  // delete chat  
  deleteChat: async (req, res) => {
    const {chatId} = req.params
    try {
      const chat = await Chat.findByIdAndDelete(chatId)
      if(chat) {
        // chatga tegishli message lar o'chishi kerak
        return res.status(200).json({message: 'Chat deleted successfully!', chat})
      }
      res.status(404).json({message: 'Chat not found!'})
    } catch (error) {
      res.status(503).json({message: error.message})
    }
  }
}

module.exports = chatCtrl