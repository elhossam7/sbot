export function calculatePNL(trades) {
    let totalProfit = 0;
    trades.forEach(trade => {
        totalProfit += trade.profit; // Assuming trade object has a profit property
    });
    return totalProfit;
}

export function logTrade(trade) {
    console.log(`Trade executed: ${trade.id}, Profit: ${trade.profit}, Timestamp: ${new Date().toISOString()}`);
}