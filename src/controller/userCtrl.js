const bcrypt = require('bcrypt')
const {v4} = require('uuid')

const fs = require('fs')
const path = require('path')

const Users = require('../model/userModel')

const uploadsDir = path.join(__dirname, '../', 'public')

const userCtrl = {
  getAllUsers: async (req, res) => {
    try {
      let users = await Users.find()

      users = users.map(user => {
        const {password, ...otherDetails} = user._doc
        return otherDetails
      })

      res.status(200).json({message: 'All users', users})
    } catch (error) {
      res.status(503).json({message: error.message})
    }
  },

  // get a user

  getUser: async (req, res) => {
    try {
      const {id} = req.params
      const user = await Users.findById(id)
      if(user) {
        const {password, ...otherDetails} = user._doc
        return res.status(200).json({message: 'Found user!', user: otherDetails})
      }
      res.status(404).json({message: 'User not found!'})
    } catch (error) {
      res.status(503).json({message: error.message})
    }
  },

  // update a user

  updateUser: async (req, res) => {
    try {
      const {id} = req.params
      if(id === req.user._id || req.userIsAdmin) {
        const user = await Users.findById(id)
        if(!user) {
          return res.status(404).json({message: 'User not found!'})
        }

        if(req.body.password && req.body.password != "") {
          const hashedPass = await bcrypt.hash(req.body.password, 10)
          req.body.password = hashedPass
        } else {
          delete req.body.password
        }

        if(req.files) {
          if(req.files.profilePicture) {
            const {profilePicture} = req.files
            const format = profilePicture.mimetype.split('/')[1]
            if(format !== 'png' && format !== 'jpeg') {
              return res.status(403).json({message: 'File format is incorrect!'})
            }
            const nameImg = `${v4()}.${format}`
            profilePicture.mv(path.join(uploadsDir, nameImg), (err) => {
              if(err) {
                res.status(503).json({message: err.message})
              }
            })

            req.body.profilePicture = nameImg
            if(user.profilePicture) {
              await fs.unlink(path.join(uploadsDir, user.profilePicture), (err) => {
                if(err) {
                  res.status(503).json({message: err.message})
                }
              })
            }
          }

          if(req.files.coverPicture) {
            const {coverPicture} = req.files
            const format = coverPicture.mimetype.split('/')[1]
            if(format !== 'png' && format !== 'jpeg') {
              return res.status(403).json({message: 'File format is incorrect!'})
            }
            const nameImg = `${v4()}.${format}`
            coverPicture.mv(path.join(uploadsDir, nameImg), (err) => {
              if(err) {
                res.status(503).json({message: err.message})
              }
            })

            req.body.coverPicture = nameImg
            if(user.coverPicture) {
              await fs.unlink(path.join(uploadsDir, user.coverPicture), (err) => {
                if(err) {
                  res.status(503).json({message: err.message})
                }
              })
            }
          }
        }

        const updateUser = await Users.findByIdAndUpdate(id, req.body, {new: true})

        return res.status(200).json({message: 'User updated successfully', user: updateUser})

      } else {
        res.status(405).json({message: 'Access Denied!, You can update only your own account!'})
      }
    } catch (error) {
      res.status(503).json({message: error.message})
    }
  },

  // delete a user

  deleteUser: async (req, res) => {
    const {id} = req.params
    try {
      if(id === req.user._id || req.userIsAdmin) {        
        const deletedUser = await Users.findByIdAndDelete(id);

        if(deletedUser) {
          if(deletedUser.profilePicture) {
            await fs.unlink(path.join(uploadsDir, deletedUser.profilePicture), (err) => {
              if(err) {
                return res.status(503).send({message: err.message})
              }
            });
          }

          if(deletedUser.coverPicture) {
            await fs.unlink(path.join(uploadsDir, deletedUser.coverPicture), (err) => {
              if(err) {
                return res.status(503).send({message: err.message})
              }
            });
          }
          return res.status(200).json({message: "User deleted successfully!", user: deletedUser})
        }
        return res.status(404).json({message: "User not found"})
      } 
      res.status(405).json({message: "Acces Denied!. You can delete only your own account"})
    } catch (error) {
      console.log(error);
      res.status(503).json({message: error.message})
    }
  }
}


module.exports = userCtrl;