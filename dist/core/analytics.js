export function calculatePNL(trades) {
    let pnl = 0;
    trades.forEach((trade) => {
        if (trade.side === 'sell') {
            pnl += trade.price * trade.size;
        }
        else {
            pnl -= trade.price * trade.size;
        }
    });
    return pnl;
}
export function logTrade(trade) {
    console.log(`New trade: ${trade.side} ${trade.size} @ ${trade.price}`);
}
//# sourceMappingURL=analytics.js.map