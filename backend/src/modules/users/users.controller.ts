import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { UsersService } from './users.service';

const usersService = new UsersService();

export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const users = await usersService.getUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await usersService.updateUser(req.params.id as string, req.body);
    res.json(user);
  } catch (error) {
    next(error);
  }
};
