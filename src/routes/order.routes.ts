import { Router } from 'express';
import { OrderController } from '../controllers/order.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validatePlaceOrder, validateOrderId } from '../middlewares/order.validation.js';

const router = Router();

// All order routes require authentication
router.use(protect);

// POST /api/orders - Place a new order
router.post('/', validatePlaceOrder, OrderController.placeOrder);

// GET /api/orders - Get user's orders with pagination
router.get('/', OrderController.getUserOrders);

// GET /api/orders/:orderId - Get specific order by ID
router.get('/:orderId', validateOrderId, OrderController.getOrder);

// PUT /api/orders/:orderId/cancel - Cancel an order
router.put('/:orderId/cancel', validateOrderId, OrderController.cancelOrder);

export default router;