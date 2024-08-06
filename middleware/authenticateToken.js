const jwt = require("jsonwebtoken");
const User = require("../models/user"); // Adjust the path if necessary

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = await User.findById(user.userId);
    console.log(req.user)
    next();
  });
}

module.exports = authenticateToken;


module.exports = authenticateToken;
