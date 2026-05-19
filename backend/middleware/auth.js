const jwt = require('jsonwebtoken');

// This middleware runs BEFORE any protected route handler
const protect = (req, res, next) => {
  try {
    // Token comes in the header: "Authorization: Bearer <token>"
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token, access denied' });
    }

    const token = authHeader.split(' ')[1]; // Extract just the token part

    // Verify token — throws an error if expired or tampered with
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the userId to the request so routes can use it
    req.userId = decoded.userId;

    next(); // Move on to the actual route handler
  } catch (error) {
    res.status(401).json({ message: 'Token invalid or expired' });
  }
};

module.exports = protect;