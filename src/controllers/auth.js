// Access Control User
const ensureAuthenticatedUser = (req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.user && req.user.type === "USER") {
      next();
    } else {
      return res.status(401).json({
        statusCode: 401,
        msg: `You are not authorized! Please login with an User account...`,
      });
    }
  } else {
    return res.status(401).json({
      statusCode: 401,
      msg: `You are not authorized! Please login...`,
    });
  }
};

module.exports = {
  ensureAuthenticatedUser,
};
