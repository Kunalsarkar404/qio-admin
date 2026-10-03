export interface AdminOrderItem {
    _id: string;
    product: {
        id: string;
        name: string;
        image: string;
    };
    name: string;
    image: string;
    size: string;
    color: string;
    price: number;
    quantity: number;
    rating?: number;
}

export interface AdminOrder {
    _id: string;
    orderNumber: string;
    user: {
        _id: string;
        name: string;
        email: string;
    };
    items: AdminOrderItem[];
    shippingAddress: {
        label?: string;
        fullName?: string;
        phone?: string;
        street?: string;
        city?: string;
        state?: string;
        zip?: string;
        country?: string;
    };
    status: 'Packing' | 'Picked' | 'In Transit' | 'Delivered' | 'Cancelled';
    paymentMethod: 'wallet' | 'card';
    subtotal: number;
    discount: number;
    vat: number;
    shippingFee: number;
    total: number;
    createdAt: string;
    updatedAt: string;
}

export interface OrderStats {
    totalOrders: number;
    completedOrders: number;
    ongoingOrders: number;
    cancelledOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
}
