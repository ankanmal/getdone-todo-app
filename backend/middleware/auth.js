const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  console.log(req.cookies);
  const { token } = req.cookies;

  //if token is not there
  if (!token) {
    res.status(403).send("Token is missing");
  }
  try {
    const decode = jwt.verify(token, "shhhhh");
    console.log(decode);
    req.user = decode;
  } catch (error) {
    console.log(error);
    res.status(403).send("token is invalid");
  }

  return next();
};
module.export = auth;
