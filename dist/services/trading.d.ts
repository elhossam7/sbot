import { Connection, PublicKey } from '@solana/web3.js';
export declare function executeSellOrder(connection: Connection, tokenMint: PublicKey, amount: number, minPrice: number): Promise<string>;
export declare function getUserBalance(connection: Connection, userId: string): Promise<number>;
export declare function getUserTokenBalance(connection: Connection, userId: string, token: string): Promise<number>;
export declare function getTokenPrice(connection: Connection, token: string): Promise<number>;
export declare function executeBuyOrder({ connection, userId, token, amount, price }: {
    connection: Connection;
    userId: string;
    token: string;
    amount: number;
    price: number;
}): Promise<string>;
export declare function updateUserPortfolio(userId: string, params: {
    token: string;
    amount: number;
    transactionType: 'BUY' | 'SELL';
    orderId: string;
    price: number;
}): Promise<void>;
