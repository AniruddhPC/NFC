const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({
    message: 'Access Denied: Administrator privileges required to perform this action.',
  });
};

module.exports = {
  requireAdmin,
};
