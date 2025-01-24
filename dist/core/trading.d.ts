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
export declare function executeTrade(trade: Trade): void;
export declare function setLimitOrder(order: LimitOrder): void;
