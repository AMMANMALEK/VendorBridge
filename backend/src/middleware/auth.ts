import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthRequest, UserPayload } from '../types';

export const protect = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    let token: string | undefined;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({ message: 'Not authorized, no token provided' });
      return;
    }

    const decoded = jwt.verify(token, config.jwtSecret) as { id: string };
    req.user = { id: decoded.id } as UserPayload;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};

export const authorize = (...roles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      const user = await prisma.user.findUnique({ where: { id: req.user?.id } });
      if (!user || !roles.includes(user.role)) {
        res.status(403).json({ message: `Role not authorized for this action` });
        return;
      }
      req.user = { id: user.id, name: user.name, email: user.email, role: user.role };
      next();
    } catch (error) {
      res.status(403).json({ message: 'Authorization failed' });
    }
  };
};
