const router = require("express").Router();
const User = require("../Models/userModels");
const bcrypt = require("bcrypt");
const { response } = require("express");


// Register
router.post("/register", async (req, res) => {

   try {
    // Genarate new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password,salt);

    // Create new User
    const newUser = new User({
        username: req.body.username,
        email: req.body.email,
          password: hashedPassword,
    
       })

    //    Save  user amd  response
    const user = await newUser.save();
    res.status(200).json(user);

   } catch (error) {
    res.status(500).json(error);
   }
})


// Login
router.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({email: req.body.email});
        !user && res.status(404).send("User Not Found")

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        !validPassword && res.status(400).send("Password has Wrong");

        res.status(200).json(user);
        
    } catch (error) {
        res.status(500).json(error);
    }
})

module.exports = router;