import Router from 'express';
import { getAllusers, getCurrentUser, updateUser, deleteUser } from '../controllers/userController.js';

const router = Router();

router.get('/', getAllusers);

router.get('/:id', getCurrentUser);

router.patch('/:id', updateUser);

router.delete('/:id', deleteUser);

export default router;