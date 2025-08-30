import { PrismaClient } from '@prisma/client';
import type { PlaceOrderRequest } from '../types/order.types.js';
import { AppError } from '../middlewares/error.middleware.js';

const prisma = new PrismaClient();

export class OrderService {
  private static readonly BASE_FEE = 5.00;
  private static readonly PRICE_PER_KM = 2.50;
  private static readonly MIN_DELIVERY_FEE = 8.00;

  private static calculateDistance(pickup: any, delivery: any) {
    const isSameCity = pickup.city.toLowerCase() === delivery.city.toLowerCase();
    return isSameCity ? Math.random() * 10 + 2 : Math.random() * 50 + 15;
  }

  private static calculatePricing(distance: number, estimatedValue?: number) {
    const baseFee = this.BASE_FEE;
    let deliveryFee = Math.max(distance * this.PRICE_PER_KM, this.MIN_DELIVERY_FEE);
    
    if (estimatedValue && estimatedValue > 100) {
      deliveryFee += Math.min(estimatedValue * 0.02, 20);
    }
    
    const totalAmount = baseFee + deliveryFee;
    const estimatedDelivery = new Date(Date.now() + (distance / 25) * 60 * 60 * 1000 + 15 * 60 * 1000);
    
    return {
      baseFee: Number(baseFee.toFixed(2)),
      deliveryFee: Number(deliveryFee.toFixed(2)),
      totalAmount: Number(totalAmount.toFixed(2)),
      estimatedDelivery
    };
  }

  private static async validateAddresses(userId: string, pickupAddressId: string, deliveryAddressId: string) {
    const [pickupAddress, deliveryAddress] = await Promise.all([
      prisma.address.findFirst({ where: { id: pickupAddressId, userId } }),
      prisma.address.findFirst({ where: { id: deliveryAddressId, userId } })
    ]);

    if (!pickupAddress) throw new AppError('Pickup address not found', 404);
    if (!deliveryAddress) throw new AppError('Delivery address not found', 404);

    return { pickupAddress, deliveryAddress };
  }

  static async placeOrder(userId: string, orderData: PlaceOrderRequest) {
    try {
      const { pickupAddress, deliveryAddress } = await this.validateAddresses(
        userId, orderData.pickupAddressId, orderData.deliveryAddressId
      );

      const distance = this.calculateDistance(pickupAddress, deliveryAddress);
      const pricing = this.calculatePricing(distance, orderData.estimatedValue);

      const order = await prisma.order.create({
        data: {
          userId,
          pickupAddressId: orderData.pickupAddressId,
          deliveryAddressId: orderData.deliveryAddressId,
          itemDescription: orderData.itemDescription,
          itemImage: orderData.itemImage,
          specialInstructions: orderData.specialInstructions,
          estimatedValue: orderData.estimatedValue,
          baseFee: pricing.baseFee,
          deliveryFee: pricing.deliveryFee,
          totalAmount: pricing.totalAmount,
          scheduledPickup: orderData.scheduledPickup ? new Date(orderData.scheduledPickup) : undefined,
          estimatedDelivery: pricing.estimatedDelivery,
          status: 'PENDING'
        },
        include: {
          pickupAddress: true,
          deliveryAddress: true,
          user: { select: { id: true, name: true, email: true, phone: true } }
        }
      });

      await prisma.orderTracking.create({
        data: { orderId: order.id, status: 'PENDING', notes: 'Order placed successfully' }
      });

      return order;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to place order', 500);
    }
  }

  static async getOrderById(orderId: string, userId?: string) {
    const whereClause: any = { id: orderId };
    if (userId) whereClause.userId = userId;

    const order = await prisma.order.findFirst({
      where: whereClause,
      include: {
        pickupAddress: true,
        deliveryAddress: true,
        user: { select: { id: true, name: true, email: true, phone: true } },
        rider: { select: { id: true, name: true, phone: true, vehicleType: true } },
        tracking: { orderBy: { timestamp: 'desc' } }
      }
    });

    if (!order) throw new AppError('Order not found', 404);
    return order;
  }

  static async getUserOrders(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        include: {
          pickupAddress: true,
          deliveryAddress: true,
          rider: { select: { id: true, name: true, phone: true, vehicleType: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.order.count({ where: { userId } })
    ]);

    return {
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    };
  }
}