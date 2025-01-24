import { Trade } from '../types/Trade.js';

export function calculatePNL(trades: Trade[]): number {
    let pnl = 0;
    trades.forEach((trade: Trade) => {
        if (trade.side === 'sell') {
            pnl += trade.price * trade.size;
        } else {
            pnl -= trade.price * trade.size;
        }
    });
    return pnl;
}

export function logTrade(trade: Trade): void {
    console.log(`New trade: ${trade.side} ${trade.size} @ ${trade.price}`);
}