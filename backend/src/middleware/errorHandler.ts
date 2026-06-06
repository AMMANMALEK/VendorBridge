import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  console.error(err.stack);

  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'field';
    res.status(400).json({ message: `Duplicate value for ${field}` });
    return;
  }

  if (err.code === 'P2025') {
    res.status(404).json({ message: 'Record not found' });
    return;
  }

  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal server error'
  });
};
