import { sendMessage } from '../api/telegram';
import { executeTrade, setLimitOrder } from '../core/trading';
import { Telegraf, Context } from 'telegraf';
import { handleStart } from './handlers.js';

export function registerCommands(bot: Telegraf<Context>) {
  // Main menu commands
  bot.command('start', handleStart);

  bot.onText(/\/buy (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const amount = match[1];

    // Logic to handle buy command
    executeTrade(amount)
      .then(result => sendMessage(chatId, `Trade executed: ${result}`))
      .catch(error => sendMessage(chatId, `Error executing trade: ${error.message}`));
  });

  bot.onText(/\/sell (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const amount = match[1];

    // Logic to handle sell command
    executeTrade(-amount)
      .then(result => sendMessage(chatId, `Trade executed: ${result}`))
      .catch(error => sendMessage(chatId, `Error executing trade: ${error.message}`));
  });

  bot.onText(/\/limit (.+) (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const amount = match[1];
    const price = match[2];

    // Logic to handle limit order command
    setLimitOrder(amount, price)
      .then(result => sendMessage(chatId, `Limit order set: ${result}`))
      .catch(error => sendMessage(chatId, `Error setting limit order: ${error.message}`));
  });

  // Menu button handlers
  bot.hears('💰 Balance', async (ctx) => {
    await ctx.reply('Your balance will be displayed here');
  });
  bot.hears('📈 Buy', async (ctx) => {
    await ctx.reply('Buy screen');
  });
  bot.hears('📉 Sell', async (ctx) => {
    await ctx.reply('Sell screen');
  });
  bot.hears('📊 Positions', async (ctx) => {
    await ctx.reply('Your open positions will be displayed here');
  });
  bot.hears('⏰ Limit Orders', async (ctx) => {
    await ctx.reply('Set your limit orders here');
  });
  bot.hears('🔄 DCA', async (ctx) => {
    await ctx.reply('Set up Dollar-Cost Averaging orders here');
  });
  bot.hears('👥 Copy Trade', async (ctx) => {
    await ctx.reply('Copy trades of experienced traders here');
  });
  bot.hears('🎯 Sniper', async (ctx) => {
    await ctx.reply('Sniper feature');
  });
  bot.hears('⚔️ Trenches', async (ctx) => {
    await ctx.reply('Trenches feature');
  });
  bot.hears('🔗 Referrals', async (ctx) => {
    await ctx.reply('Refer new users and earn rewards');
  });
  bot.hears('👀 Watchlist', async (ctx) => {
    await ctx.reply('Your watchlist');
  });
  bot.hears('💳 Withdraw', async (ctx) => {
    await ctx.reply('Withdraw your cryptocurrencies');
  });
  bot.hears('⚙️ Settings', async (ctx) => {
    await ctx.reply('Customize your account settings');
  });
  bot.hears('❓ Help', async (ctx) => {
    await ctx.reply('Help documentation and FAQs');
  });
  bot.hears('🔄 Refresh', async (ctx) => {
    await ctx.reply('Refreshing information...');
  });
}