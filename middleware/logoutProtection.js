const protectRoute = (req, res, next) => {
  if (!req.user) {
    next();
  } else {
    res.redirect('/profile');
  }
};

module.exports = protectRoute;
