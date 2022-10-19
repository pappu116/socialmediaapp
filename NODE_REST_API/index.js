const express = require('express');
const app = express();
const mongoose = require('mongoose');
const helmet = require('helmet');
const dotenv = require('dotenv');
const morgan = require('morgan');
const userRoute = require("./Routes/userRoutes");
const authRoute = require("./Routes/authRoutes");
const postRoute = require("./Routes/postRoutes");
const conversationRoute = require("./Routes/conversationRouter");
const messageRoute = require("./Routes/MessageRouter");
const multer = require('multer');
const path = require('path');

dotenv.config()

mongoose.connect(process.env.MONGO_URL,{useNewUrlParser:true},()=>{
    console.log('MongoDB Connected!');
});

app.use("/images", express.static(path.join(__dirname,"public/images")));

// middleware
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

// image upload code start

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "public/images");
    },
    filename: (req, file, cb) => {
      cb(null, req.body.name);
    },
  });
  
  const upload = multer({ storage: storage });
  app.post("/api/upload", upload.single("file"), (req, res) => {
    try {
      return res.status(200).json("File uploded successfully");
    } catch (error) {
      console.error(error);
    }
  });

// Image upload code end

app.use("/api/users",userRoute)

app.use("/api/auth",authRoute)
app.use("/api/posts",postRoute)
app.use("/api/conversations",conversationRoute)
app.use("/api/messages",messageRoute)


app.listen(8800,()=>{
console.log('Backend Server is Running!');
})