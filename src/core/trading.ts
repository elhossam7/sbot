export interface Trade {
    id: string;
    token: string;
    amount: number;
    price: number;
    timestamp: Date;
    type: 'buy' | 'sell';
}

export interface LimitOrder {
    id: string;
    token: string;
    limitPrice: number;
    amount: number;
    isActive: boolean;
}

export function executeTrade(trade: Trade): void {
    console.log(`Executing trade: ${trade.id}`);
    // Validate trade parameters
    if (trade.amount <= 0 || trade.price <= 0) {
        throw new Error('Invalid trade parameters');
    }

    // Calculate total value
    const totalValue = trade.amount * trade.price;
    
    // Log trade execution
    console.log(`Trading ${trade.amount} ${trade.token} at ${trade.price} SOL. Total: ${totalValue} SOL`);
}

export function setLimitOrder(order: LimitOrder): void {
    // Validate order parameters
    if (order.amount <= 0 || order.limitPrice <= 0) {
        throw new Error('Invalid limit order parameters');
    }

    // Calculate potential total value
    const potentialValue = order.amount * order.limitPrice;

    // Set the order as active
    order.isActive = true;

    // Log limit order setup
    console.log(`Setting limit order: ${order.id}`);
    console.log(`Token: ${order.token}`);
    console.log(`Amount: ${order.amount}`);
    console.log(`Limit Price: ${order.limitPrice} SOL`);
    console.log(`Potential Total: ${potentialValue} SOL`);
}