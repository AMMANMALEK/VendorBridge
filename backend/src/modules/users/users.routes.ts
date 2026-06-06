import { Router } from 'express';
import { getUsers, updateUser } from './users.controller';
import { protect, authorize } from '../../middleware/auth';

const router = Router();

router.get('/', protect, authorize('admin'), getUsers);
router.put('/:id', protect, authorize('admin'), updateUser);

export default router;
