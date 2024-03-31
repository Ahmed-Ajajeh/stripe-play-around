const express = require("express");
const mongoose = require("mongoose");

const userRouter = require("./routes/user");

const app = express();

app.use(express.json({}));

app.use(userRouter);

app.listen(3000);

// connecting to db :
mongoose.connect("mongodb://localhost:27017").then((connection) => {
  // console.log(connection);
  console.log("DATABASE CONNECTED");
});
