import { Connection } from '@solana/web3.js';

export interface Trade {
    id: string;
    userId: string;
    token: string;
    amount: number;
    price: number;
    timestamp: Date;
}

export interface Token {
    symbol: string;
    name: string;
    decimals: number;
    liquidity: number;
}

export interface User {
    id: string;
    username: string;
    walletAddress: string;
    tradeHistory: Trade[];
}

export interface MenuKeyboard {
  text: string;
  callback_data: string;
}

export interface WalletContext {
  address: string;
  connection: Connection;
  balance?: number;
}