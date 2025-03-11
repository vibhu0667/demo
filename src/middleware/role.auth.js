const userAuthRoleBase = (requiredRole) => (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Please authenticate" });
      }
  
      if (requiredRole && req.user.role !== requiredRole) {
        return res.status(403).json({ message: "Access denied" });
      }
  
      next();
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };

  module.exports = { userAuthRoleBase };