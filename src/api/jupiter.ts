export const getTokenData = async (tokenAddress: string) => {
    const response = await fetch(`https://api.jupiter.xyz/v1/token/${tokenAddress}`);
    if (!response.ok) {
        throw new Error('Failed to fetch token data');
    }
    return response.json();
};

export const swapTokens = async (fromToken: string, toToken: string, amount: number) => {
    const response = await fetch('https://api.jupiter.xyz/v1/swap', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            fromToken,
            toToken,
            amount,
        }),
    });
    if (!response.ok) {
        throw new Error('Failed to swap tokens');
    }
    return response.json();
};