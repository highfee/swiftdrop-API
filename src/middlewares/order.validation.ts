import type { Request, Response, NextFunction } from 'express';
import { AppError } from './error.middleware.js';
import type { PlaceOrderRequest } from '../types/order.types.js';

export const validatePlaceOrder = (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      pickupAddressId,
      deliveryAddressId,
      itemDescription,
      itemImage,
      specialInstructions,
      estimatedValue,
      scheduledPickup
    }: PlaceOrderRequest = req.body;

    // Required fields validation
    if (!pickupAddressId || typeof pickupAddressId !== 'string') {
      throw new AppError('Pickup address ID is required and must be a string', 400);
    }

    if (!deliveryAddressId || typeof deliveryAddressId !== 'string') {
      throw new AppError('Delivery address ID is required and must be a string', 400);
    }

    if (!itemDescription || typeof itemDescription !== 'string' || itemDescription.trim().length === 0) {
      throw new AppError('Item description is required and cannot be empty', 400);
    }

    // Validate pickup and delivery addresses are different
    if (pickupAddressId === deliveryAddressId) {
      throw new AppError('Pickup and delivery addresses must be different', 400);
    }

    // Optional fields validation
    if (itemImage && typeof itemImage !== 'string') {
      throw new AppError('Item image must be a string', 400);
    }

    if (specialInstructions && typeof specialInstructions !== 'string') {
      throw new AppError('Special instructions must be a string', 400);
    }

    if (estimatedValue !== undefined) {
      const value = Number(estimatedValue);
      if (isNaN(value) || value < 0) {
        throw new AppError('Estimated value must be a positive number', 400);
      }
    }

    if (scheduledPickup) {
      const pickupDate = new Date(scheduledPickup);
      if (isNaN(pickupDate.getTime())) {
        throw new AppError('Scheduled pickup must be a valid date', 400);
      }
      
      // Check if scheduled pickup is in the future
      const now = new Date();
      if (pickupDate <= now) {
        throw new AppError('Scheduled pickup must be in the future', 400);
      }
    }

    // Validate item description length
    if (itemDescription.length > 500) {
      throw new AppError('Item description cannot exceed 500 characters', 400);
    }

    // Validate special instructions length
    if (specialInstructions && specialInstructions.length > 1000) {
      throw new AppError('Special instructions cannot exceed 1000 characters', 400);
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const validateOrderId = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;
    
    if (!orderId || typeof orderId !== 'string') {
      throw new AppError('Order ID is required and must be a string', 400);
    }

    // Basic CUID validation (starts with 'c' and has appropriate length)
    if (!orderId.match(/^c[a-z0-9]{24}$/)) {
      throw new AppError('Invalid order ID format', 400);
    }

    next();
  } catch (error) {
    next(error);
  }
};