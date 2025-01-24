import { executeTrade, setLimitOrder } from '../core/trading.js';
import { handleStart } from './handlers.js';
export const registerCommands = (bot) => {
    // Start command
    bot.command('start', handleStart);
    // Trade commands with amount parameter
    bot.command('buy', async (ctx) => {
        const args = ctx.message.text.split(' ');
        if (args.length < 2) {
            return ctx.reply('Usage: /buy <amount> <token>');
        }
        const amount = args[1];
        const token = args[2];
        try {
            const result = await executeTrade({
                id: Date.now().toString(),
                amount: Number(amount),
                token,
                price: 0,
                type: 'buy',
                timestamp: new Date()
            });
            await ctx.reply(`Buy order executed: ${result}`);
        }
        catch (error) {
            await ctx.reply(`Error executing buy order: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    });
    bot.command('sell', async (ctx) => {
        const args = ctx.message.text.split(' ');
        if (args.length < 2) {
            return ctx.reply('Usage: /sell <amount> <token>');
        }
        const amount = args[1];
        const token = args[2];
        try {
            const result = await executeTrade({
                id: Date.now().toString(),
                amount: Number(amount),
                token,
                price: 0,
                type: 'sell',
                timestamp: new Date()
            });
            await ctx.reply(`Sell order executed: ${result}`);
        }
        catch (error) {
            await ctx.reply(`Error executing sell order: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    });
    // Limit order command
    bot.command('limit', async (ctx) => {
        const args = ctx.message.text.split(' ');
        if (args.length < 3) {
            return ctx.reply('Usage: /limit <amount> <price>');
        }
        const amount = args[1];
        const price = args[2];
        try {
            const result = await setLimitOrder({
                id: Date.now().toString(),
                amount: Number(amount),
                limitPrice: Number(price),
                token: '',
                isActive: false
            });
            await ctx.reply(`Limit order set: ${result}`);
        }
        catch (error) {
            await ctx.reply(`Error setting limit order: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    });
    // Menu button handlers
    bot.hears('💰 Balance', async (ctx) => {
        try {
            // Implement balance check logic
            await ctx.reply('Fetching your balance...');
        }
        catch (error) {
            await ctx.reply('Error fetching balance');
        }
    });
    bot.hears('📈 Buy', async (ctx) => {
        await ctx.reply('Enter token and amount to buy:\n/buy <amount> <token>');
    });
    bot.hears('📉 Sell', async (ctx) => {
        await ctx.reply('Enter token and amount to sell:\n/sell <amount> <token>');
    });
    bot.hears('📊 Positions', async (ctx) => {
        await ctx.reply('Fetching your open positions...');
    });
    bot.hears('⏰ Limit Orders', async (ctx) => {
        await ctx.reply('To set a limit order:\n/limit <amount> <price>');
    });
    bot.hears('🔄 DCA', async (ctx) => {
        await ctx.reply('DCA feature coming soon!');
    });
    bot.hears('👥 Copy Trade', async (ctx) => {
        await ctx.reply('Copy trading feature coming soon!');
    });
    bot.hears('🎯 Sniper', async (ctx) => {
        await ctx.reply('Token sniping feature coming soon!');
    });
    bot.hears('⚔️ Trenches', async (ctx) => {
        await ctx.reply('Trenches feature coming soon!');
    });
    bot.hears(['⚙️ Settings', '❓ Help', '🔄 Refresh', '🔗 Referrals', '👀 Watchlist', '💳 Withdraw'], async (ctx) => {
        await ctx.reply('Feature coming soon!');
    });
    // Help command
    bot.command('help', async (ctx) => {
        const helpMessage = `
Available commands:
/start - Start the bot
/buy <amount> <token> - Buy tokens
/sell <amount> <token> - Sell tokens
/limit <amount> <price> - Set limit order
/balance - Check your balance
/help - Show this help message
    `;
        await ctx.reply(helpMessage);
    });
    return bot;
};
//# sourceMappingURL=commands.js.map