export const sendMessage = async (chatId: string, text: string) => {
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    if (!TELEGRAM_BOT_TOKEN) {
        throw new Error('TELEGRAM_BOT_TOKEN is not defined');
    }

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chat_id: chatId,
            text: text,
        }),
    });

    if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`);
    }

    return await response.json();
};

export const handleCommand = (command: string, chatId: string) => {
    switch (command.toLowerCase()) {
        case '/start':
            return sendMessage(chatId, 'Welcome to the Solana Trading Bot! Use /help to see available commands.');
        case '/help':
            return sendMessage(chatId, 
                'Available commands:\n' +
                '/start - Start the bot\n' +
                '/help - Show this help message\n' +
                '/status - Check bot status'
            );
        case '/status':
            return sendMessage(chatId, 'Bot is running normally.');
        default:
            return sendMessage(chatId, 'Unknown command. Use /help to see available commands.');
    }
};