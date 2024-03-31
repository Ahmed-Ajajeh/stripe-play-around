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
    "mongodb+srv://ajajeh356:testingtesting@project.hnzeyqm.mongodb.net/?retryWrites=true&w=majority&appName=project"
  )
  .then((connection) => {
    // console.log(connection);
    console.log("DATABASE CONNECTED");
  });
