import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export const generateToken = (payload: object, expiresIn: string = '1d') => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn as any });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};
