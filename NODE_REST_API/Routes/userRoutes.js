const router = require('express').Router();
const User = require("../Models/userModels");
const bcrypt = require("bcrypt");


// Update user
router.put("/:id", async (req, res) => {

    if (req.body.userId === req.params.id || req.body.isAdmin) {
        
        if(req.body.password){
            try {
                const salt = await bcrypt.genSalt(10)
                req.body.password = await bcrypt.hash(req.body.password, salt)
            } catch (error) {
               return res.status(500).send(error)
            }
        }

        try {
            const user = await User.findByIdAndUpdate(req.params.id,{
                $set: req.body,
            })
            res.status(200).json("Account has been Updated");
        } catch (error) {
            return res.status(500).send(error)
        }

    } else {
        return res.status(403).json("You can update Only Your Account");
    }

})


// delete user
router.delete("/:id", async (req, res) => {

    if (req.body.userId === req.params.id || req.body.isAdmin) {
        

        try {
            const user = await User.findByIdAndDelete(req.params.id)
            res.status(200).json("Account has been Deleted Successfully");
        } catch (error) {
            return res.status(500).send(error)
        }

    } else {
        return res.status(403).json("You can Delete Only Your Account");
    }

})
// get a user
router.get("/", async (req, res) =>{
    const userId = req.query.userId;
    const username = req.query.username;

    try {
        const user = userId ? await User.findById(userId) : await User.findOne({username: username})
        const {password,updatedAt, ...others} = user._doc
        res.status(200).json(others);
    } catch (error) {
      return  res.status(500).send(error)
    }
})


// get Friends
router.get("/friends/:userId", async (req, res) =>{
    try {
        const user = await User.findById(req.params.userId);
        const friends = await Promise.all(
            user.followings.map(friendId=>{
                return User.findById(friendId)
            })
        )
        let friendList =[];
        friends.map(friend=>{
            const {_id,username,profilePicture} = friend;
            friendList.push({_id,username,profilePicture});
        });
        res.status(200).json(friendList);
        
    } catch (error) {
        res.status(500).json(error)
    }
})

// follow a user
router.put("/:id/follow", async (req, res) => {

    if (req.body.userId !== req.params.id ){

        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);
            if(!user.followers.includes(req.body.userId)){
                await user.updateOne({$push:{followers:req.body.userId}});
                await currentUser.updateOne({$push:{followings:req.params.id}});
                res.status(200).json("User has been Followed");
            }else{
                res.status(403).json("You Have Already Follow This User")
            }
            
        } catch (error) {
            return res.status(500).send(error)
        }

    }else{
        return res.status(403).json("You can not Follow Only YourSelf");
    }

})


// unfollow a user
router.put("/:id/unfollow", async (req, res) => {

    if (req.body.userId !== req.params.id ){

        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);
            if(user.followers.includes(req.body.userId)){
                await user.updateOne({$pull:{followers:req.body.userId}});
                await currentUser.updateOne({$pull:{followings:req.params.id}});
                res.status(200).json("User has been UnFollowed");
            }else{
                res.status(403).json("You Don't  Follow This User")
            }
            
        } catch (error) {
            return res.status(500).send(error)
        }

    }else{
        return res.status(403).json("You can not UnFollow Only YourSelf");
    }

})



module.exports = router