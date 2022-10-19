const router = require('express').Router();
const Post = require('../Models/postModels')
const User = require('../Models/userModels')

// create a Post
router.post("/", async (req, res)=>{
    const newPost = new Post (req.body);
    try {
        const savePost = await newPost.save();
        res.status(201).json(savePost);
    } catch (error) {
        res.status(500).json(error)
    }
})


// update a post
router.put("/:id", async (req, res)=>{
    try {
        const post = await Post.findById(req.params.id);
        if (post.userId === req.body.userId) {
            await post.updateOne({$set:req.body});
            res.status(200).json("This post has been updated successfully")
            
        } else {
            res.status(403).json("You can Update only your Post")
        }
        
    } catch (error) {
        return res.status(500).json(error);
    }
})

// delete a post
router.delete("/:id", async (req, res)=>{
    try {
        const post = await Post.findById(req.params.id);
        if (post.userId === req.body.userId) {
            await post.deleteOne();
            res.status(200).json("This post has been Deleted successfully")
            
        } else {
            res.status(403).json("You can Delete only your Post")
        }
        
    } catch (error) {
        return res.status(500).json(error);
    }
})

// like dislike a post
router.put("/:id/like", async (req, res)=>{
    try {
        const post = await Post.findById(req.params.id);
        if (!post.likes.includes(req.body.userId)) {
            await post.updateOne({$push:{likes: req.body.userId}});
            res.status(200).json("This post has been liked successfully")
        } else {
            await post.updateOne({$pull:{likes: req.body.userId}});
            res.status(200).json("This post has been disliked successfully")
        }
        
    } catch (error) {
        return res.status(500).json(error)
    }
})


// get a post
router.get("/:id", async (req, res)=>{
    try {
        const post = await Post.findById(req.params.id);
        res.status(200).json(post);
        
    } catch (error) {
        return res.status(500).json(error)
    }
})

// get timeline posts
router.get("/timeline/:userId", async (req, res) => {
    try {
        const currentUser = await User.findById(req.params.userId);
       console.log(currentUser);
        const userPosts = await Post.find({ userId: currentUser._id});
        const friendPosts = await Promise.all(
            currentUser.followings.map((friendId)=>{
                return Post.find({ userId: friendId});
            })
        )
        res.status(200).json(userPosts.concat(...friendPosts))
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
})

// get user all posts
router.get("/profile/:username", async (req, res) => {
    try {
        const user = await User.findOne({username: req.params.username});
        const posts = await Post.find({userId: user._id})
        res.status(200).json(posts)
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
})

module.exports = router;