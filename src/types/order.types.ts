export interface PlaceOrderRequest {
  pickupAddressId: string;
  deliveryAddressId: string;
  itemDescription: string;
  itemImage?: string;
  specialInstructions?: string;
  estimatedValue?: number;
  scheduledPickup?: string; // ISO date string
}

export interface PlaceOrderResponse {
  id: string;
  userId: string;
  pickupAddressId: string;
  deliveryAddressId: string;
  itemDescription: string;
  itemImage?: string;
  specialInstructions?: string;
  estimatedValue?: number;
  baseFee: number;
  deliveryFee: number;
  totalAmount: number;
  status: string;
  scheduledPickup?: string;
  estimatedDelivery?: string;
  createdAt: string;
}

export interface OrderCalculation {
  baseFee: number;
  deliveryFee: number;
  totalAmount: number;
  estimatedDelivery: Date;
}

export interface AddressDistance {
  distance: number; // in kilometers
  duration: number; // in minutes
}