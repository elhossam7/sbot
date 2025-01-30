export const getSwapRate = async () => {
try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
    const data = await response.json();
    return data.solana.usd;
} catch (error) {
    console.error('Error fetching swap rate:', error);
    throw error;
}
};

export const getUserBalance = async (userId) => {
    try {
        const balance = await db.collection('users').doc(userId).get();
        return balance.data()?.balance || 0;
    } catch (error) {
        console.error('Error getting user balance:', error);
        throw error;
    }
};

export const updateUserBalance = async (userId, newBalance) => {
try {
    await db.collection('users').doc(userId).update({
        balance: newBalance
    });
} catch (error) {
    console.error('Error updating user balance:', error);
    throw error;
}
};
