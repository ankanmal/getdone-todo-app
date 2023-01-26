require("dotenv").config();
require("./config/database").connect();
const express = require("express");
const app = express();
const User = require("./model/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");

//custom middleware
const auth = require("./middleware/auth");
const user = require("./model/user");

//express middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("<h1>Welcome to Ineuron</h1>");
});

app.post("/register", async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;
    //it checks for all the fields are there or not
    if (!(email && password && firstname && lastname)) {
      res.status(400).send("All Fields Required");
    }
    //now check for uniqueEmail
    const existEmail = await User.findOne(email);
    if (existEmail) {
      res.status(400).send("Email Already Exist");
    }
    //password excryption
    const encryptedPassword = await bcrypt.hash(password, 10);

    //create a new entry in database
    const user = await User.create({
      firstname,
      lastname,
      email,
      password: encryptedPassword,
    });

    //create a token and send it to user
    const token = jwt.sign(
      {
        id: user._id,
        email,
      },
      "shhhhh",
      { expiresIn: "2h" }
    );

    user.token = token;
    //don't want to send the password to the frontend
    user.password = undefined;
    res.status(201).json(user);
  } catch (error) {
    console.log(error);
    console.log("Error in response route");
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    //validation
    if (!(email && password)) {
      res.status(403).send("email & password is required");
    }

    //check if user exist or not in the database
    const user = await User.findOne(email);

    if (!user) {
      res.status(403).send("Email Not found Please Register");
    }
    //match the password
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ id: user._id, email }, "shhhhh", {
        expiresIn: "2h",
      });
      user.password = undefined;
      user.token = token;

      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };
      res.status(200).cookie("token", token, options).json({
        success: true,
        token,
        user,
      });
    }

    res.status(403).send("Email or Password is inCorrect");
  } catch (error) {
    console.log(error);
    console.log("error in the request");
  }
});

module.exports = app;
