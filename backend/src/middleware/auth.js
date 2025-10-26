const jwt = require("jsonwebtoken");

const authMiddleware = (allowedRoles = []) => {
  return (req, res, next) => {
    const auth = req.headers.authorization;
    let token;
    if (auth && auth.startsWith("Bearer ")) {
      token = auth.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      // fallback to httpOnly cookie
      token = req.cookies.token;
    }
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    try {
      // Try verifying with access secret first, fallback to refresh secret
      let payload;
      try {
        payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      } catch (e) {
        payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      }
      req.user = { id: payload.id, role: payload.role };
      if (allowedRoles.length && !allowedRoles.includes(payload.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
};

module.exports = { authMiddleware };
