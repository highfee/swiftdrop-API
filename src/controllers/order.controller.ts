import type { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service.js';
import { AppError } from '../middlewares/error.middleware.js';
import type { AuthRequest } from '../middlewares/auth.middleware.js';
import type { PlaceOrderRequest } from '../types/order.types.js';

export class OrderController {
  /**
   * Place a new order
   */
  static async placeOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const orderData: PlaceOrderRequest = req.body;
      const order = await OrderService.placeOrder(userId, orderData);

      res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        data: {
          id: order.id,
          userId: order.userId,
          pickupAddressId: order.pickupAddressId,
          deliveryAddressId: order.deliveryAddressId,
          itemDescription: order.itemDescription,
          itemImage: order.itemImage,
          specialInstructions: order.specialInstructions,
          estimatedValue: order.estimatedValue,
          baseFee: order.baseFee,
          deliveryFee: order.deliveryFee,
          totalAmount: order.totalAmount,
          status: order.status,
          scheduledPickup: order.scheduledPickup,
          estimatedDelivery: order.estimatedDelivery,
          createdAt: order.createdAt,
          pickupAddress: order.pickupAddress,
          deliveryAddress: order.deliveryAddress
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get order by ID
   */
  static async getOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { orderId } = req.params;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const order = await OrderService.getOrderById(orderId, userId);

      res.status(200).json({
        success: true,
        message: 'Order retrieved successfully',
        data: order
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user orders with pagination
   */
  static async getUserOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      // Validate pagination parameters
      if (page < 1 || limit < 1 || limit > 50) {
        throw new AppError('Invalid pagination parameters', 400);
      }

      const result = await OrderService.getUserOrders(userId, page, limit);

      res.status(200).json({
        success: true,
        message: 'Orders retrieved successfully',
        data: result.orders,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel an order
   */
  static async cancelOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { orderId } = req.params;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      // Implementation for cancel order would go here
      // For now, just return a placeholder response
      res.status(200).json({
        success: true,
        message: 'Order cancellation feature coming soon',
        data: { orderId }
      });
    } catch (error) {
      next(error);
    }
  }
}