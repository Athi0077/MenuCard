const jwt = require('jsonwebtoken');

const protectAdmin = async (req, res, next) => {
  let token = req.query.token; // Support for SSE EventSource which cannot send headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey123');
      req.adminId = decoded.id;
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Authentication failed: Invalid security token' });
    }
  }

  return res.status(401).json({ message: 'Authorization rejected: Access restricted to staff portals' });
};

module.exports = protectAdmin;
