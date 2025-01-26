import { Telegraf, Context } from 'telegraf';
import { Message } from 'telegraf/types';
import { Connection, PublicKey } from '@solana/web3.js';
import { executeTrade, setLimitOrder } from '../core/trading.js';
import { mainMenuKeyboard, handleStart } from './handlers.js';
import { getUserWallet } from '../index.js';

const validateTokenAddress = (address: string): boolean => {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
};
import { calculateSwap, simulateSwap, executeBuy } from '../services/swap.js';

export const registerCommands = (bot: Telegraf<Context>) => {
  // Start command
  bot.command('start', handleStart);

  // Buy command
  bot.command('buy', async (ctx: Context) => {
    if (!ctx.message || !('text' in ctx.message)) {
      return ctx.reply('Invalid message format');
    }
    const [_, tokenAddress, amount] = ctx.message.text.split(' ');
    const numericAmount = parseFloat(amount);

    if (!tokenAddress || isNaN(numericAmount)) {
      return ctx.reply('Invalid format. Use: /buy <TOKEN_ADDRESS> <AMOUNT>');
    }

    try {
      const userId = ctx.from?.id.toString();
      if (!userId) {
        throw new Error('User ID not found');
      }

      const { publicKey } = await getUserWallet(userId);

      // Validate token address
      if (!validateTokenAddress(tokenAddress)) {
        return ctx.reply('Invalid token address.');
      }

      // Fetch swap route and simulate transaction
      const swapDetails = await calculateSwap('So11111111111111111111111111111111111111112', tokenAddress, numericAmount);
      const simulation = await simulateSwap(swapDetails.transaction);

      if (!simulation.success) {
        return ctx.reply('Transaction simulation failed.');
      }

      // Confirm swap details with user
      await ctx.reply(
        `Swap Details:\n` +
        `Token: ${tokenAddress}\n` +
        `Amount: ${numericAmount}\n` +
        `Price Impact: ${swapDetails.priceImpactPct}%\n` +
        `Confirm execution? (yes/no)`
      );

      // Wait for user confirmation
      bot.on('text', async (confirmationCtx) => {
        if (confirmationCtx.message.text.toLowerCase() === 'yes') {
          const signature = await executeBuy(userId, tokenAddress, numericAmount);
          await ctx.reply(`✅ Buy order executed!\n📄 TX: https://solscan.io/tx/${signature}`);
        } else {
          await ctx.reply('Buy order cancelled.');
        }
      });
    } catch (error) {
      console.error('Buy command error:', error);
      await ctx.reply(`Error executing buy order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  bot.command('sell', async (ctx: Context) => {
    if (!ctx.message || !('text' in ctx.message)) {
      return ctx.reply('Invalid message format');
    }
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
    } catch (error) {
      await ctx.reply(`Error executing sell order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  // Limit order command
  bot.command('limit', async (ctx: Context) => {
    if (!ctx.message || !('text' in ctx.message)) {
      return ctx.reply('Invalid message format');
    }
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
    } catch (error) {
      await ctx.reply(`Error setting limit order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  // Menu button handlers
  bot.hears('💰 Balance', async (ctx: Context) => {
    try {
      const userId = ctx.from?.id.toString();
      if (!userId) {
        throw new Error('User ID not found');
      }

      const { publicKey, balance } = await getUserWallet(userId);
      await ctx.reply(
        `💳 Your Wallet: ${publicKey.toBase58()}\n` +
        `💰 Balance: ${balance.toFixed(4)} SOL`
      );
    } catch (error) {
      console.error('Balance check error:', error);
      await ctx.reply('Error fetching your wallet information. Please try again.');
    }
  });

  bot.hears('📈 Buy', async (ctx: Context) => {
    await ctx.reply('Enter token and amount to buy:\n/buy <amount> <token>');
  });

  bot.hears('📉 Sell', async (ctx: Context) => {
    await ctx.reply('Enter token and amount to sell:\n/sell <amount> <token>');
  });

  bot.hears('📊 Positions', async (ctx: Context) => {
    await ctx.reply('Fetching your open positions...');
  });

  bot.hears('⏰ Limit Orders', async (ctx: Context) => {
    await ctx.reply('To set a limit order:\n/limit <amount> <price>');
  });

  bot.hears('🔄 DCA', async (ctx: Context) => {
    await ctx.reply('DCA feature coming soon!');
  });

  bot.hears('👥 Copy Trade', async (ctx: Context) => {
    await ctx.reply('Copy trading feature coming soon!');
  });

  bot.hears('🎯 Sniper', async (ctx: Context) => {
    await ctx.reply('Token sniping feature coming soon!');
  });

  bot.hears('⚔️ Trenches', async (ctx: Context) => {
    await ctx.reply('Trenches feature coming soon!');
  });

  bot.hears(['⚙️ Settings', '❓ Help', '🔄 Refresh', '🔗 Referrals', '👀 Watchlist', '💳 Withdraw'], async (ctx: Context) => {
    await ctx.reply('Feature coming soon!');
  });

  // Help command
  bot.command('help', async (ctx: Context) => {
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
