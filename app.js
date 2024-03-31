const express = require("express");
const mongoose = require("mongoose");

const userRouter = require("./routes/user");

const app = express();

app.use(express.json({}));

app.use(userRouter);

app.listen(3000);

// connecting to db :
mongoose
  .connect(
    "mongodb+srv://ajajeh356:icedMango@cluster0.8nfdnwa.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then((connection) => {
    console.log("DATABASE CONNECTED");
  });
