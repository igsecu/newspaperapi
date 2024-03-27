// Logout process
const logout = async (req, res, next) => {
  if (!req.user) {
    return res.status(400).json({
      statusCode: 400,
      msg: `No user logged in`,
    });
  }
  req.logout((err) => {
    if (err) return next(err);

    req.session.destroy((err) => {
      return res.status(200).json({
        statusCode: 200,
        msg: "You successfully logged out!",
      });
    });
  });
};

module.exports = {
  logout,
};
