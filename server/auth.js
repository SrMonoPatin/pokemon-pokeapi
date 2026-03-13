const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'pokemon-secret-change-in-production';
const JWT_EXPIRES = '7d';

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function signToken(userId, email) {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      req.userId = payload.userId;
      req.email = payload.email;
      return next();
    }
  }

  if (req.session?.userId) {
    req.userId = req.session.userId;
    req.email = req.session.email;
    return next();
  }

  return res.status(401).json({ error: 'Authentication required' });
}

module.exports = { hashPassword, verifyPassword, signToken, verifyToken, requireAuth };
