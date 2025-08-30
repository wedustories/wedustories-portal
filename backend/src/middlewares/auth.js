import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function issueToken(payload, exp = '7d') {
  return jwt.sign(payload, env.jwt, { expiresIn: exp });
}

export function auth(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'unauthenticated' });
  try {
    req.user = jwt.verify(token, env.jwt);
    next();
  } catch (e) {
    return res.status(401).json({ error: 'invalid_token' });
  }
}
