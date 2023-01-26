require("dotenv").config();
require("./config/database").connect();
const express = require("express");
const app = express();
const User = require("./model/user");

app.get("/", (req, res) => {
  res.send("<h1>Welcome to Ineuron</h1>");
});

app.post("/singup", async (req, res) => {
  const { firstname, lastname, email, password } = req.body;
  //it checks for all the fields are there or not
  if (!(email && password && firstname && lastname)) {
    res.status(400).send("All Fields Required");
  }
  //now check for uniqueEmail
  const existEmail = User.findOne(email);
  if (existEmail) {
    res.status(400).send("Email Already Exist");
  }
  //password
});

module.exports = app;
