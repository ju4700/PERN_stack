import express from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import { checkout, deleteOrder, getAllOrders, getOrder, updateOrder } from '../controllers/orderController.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/checkout', checkout);
router.get('/', getAllOrders);
router.get('/:id', getOrder);
router.patch('/:id', updateOrder);
router.delete('/:id', deleteOrder);

export default router;
