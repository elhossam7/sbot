import { Context } from 'telegraf';
import type { Message } from 'telegraf/types';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import config from '../config.js';
import { getUserBalance, getTokenPrice, executeBuyOrder, updateUserPortfolio, getUserTokenBalance } from '../services/trading.js';
import { executeSellOrder } from '../services/trading.js';
import { Markup } from 'telegraf';
import { getUserWallet } from '../index.js';

// Types
interface TradeParams {
  tokenAddress: string;
  amount: number;
  price?: number;
}

// Main menu keyboard
export const mainMenuKeyboard = Markup.keyboard([
  ['💰 Balance', '📈 Buy', '📉 Sell'],
  ['📊 Positions', '⏰ Limit Orders', '🔄 DCA'],
  ['👥 Copy Trade', '🎯 Sniper', '⚔️ Trenches'],
  ['🔗 Referrals', '👀 Watchlist', '💳 Withdraw'],
  ['⚙️ Settings', '❓ Help', '🔄 Refresh']
]).resize();

// Balance handler
export const handleBalanceCommand = async (ctx: Context) => {
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
}

// Buy handler
export const handleBuyCommand = async (ctx: any): Promise<void> => {
    const userId = ctx.from.id;
    const [amount, token] = ctx.message.text.split(' ').slice(1);

    // Logic to handle buy command
    console.log(`User ${userId} requested to buy ${amount} of ${token}`);
    // Call trading functions to execute the buy
    try {
        // Check user's balance
        const connection = new Connection(config.RPC_URL);
        const userBalance = await getUserBalance(connection, userId);
        if (userBalance < amount) {
            throw new Error('Insufficient balance');
        }

        // Verify token availability using getUserTokenBalance
        const tokenBalance = await getUserTokenBalance(connection, userId, token);
        if (tokenBalance < amount) {
            throw new Error('Token not available in requested quantity');
        }

        // Execute buy order
        const order = await executeBuyOrder({
            connection,
            userId,
            token,
            amount,
            price: await getTokenPrice(connection, token)
        });

        // Update user's portfolio
        await updateUserPortfolio(userId, {
            token,
            amount,
            price: await getTokenPrice(connection, token),
            transactionType: 'BUY',
            orderId: order
        });
        ctx.reply(`Successfully initiated buy order for ${amount} ${token}`);
    } catch (error) {
        console.error(`Error executing buy order: ${error}`);
        ctx.reply('Failed to execute buy order');
    }
}

// Sell handler
export async function handleSellCommand(ctx: any) {
  try {
    const result = await executeSellOrder(
      new Connection(config.RPC_URL),
      ctx.tokenMint,
      ctx.amount,
      ctx.minPrice
    );
    await ctx.reply(`Sell order executed: ${result}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    await ctx.reply(`Failed to execute sell order: ${errorMessage}`);
  }
}

// Helper function to parse trade parameters
function parseTradeParams(message?: string): TradeParams | null {
  if (!message) return null;

  const parts = message.split(' ');
  if (parts.length < 3) return null;

  return {
    tokenAddress: parts[1],
    amount: parseFloat(parts[2]),
    price: parts[3] ? parseFloat(parts[3]) : undefined
  };
}

// Start handler
export async function handleStartCommand(ctx: Context) {
  await ctx.reply(
    'Welcome to Solana Trading Bot!\n\n' +
    'Available commands:\n' +
    '/balance - Check wallet balance\n' +
    '/buy tokenAddress amount [price] - Place buy order\n' +
    '/sell tokenAddress amount [price] - Place sell order'
  );
}

// Create command handlers for each menu option
export const handleStart = async (ctx: Context) => {
  try {
    const userId = ctx.from?.id.toString();
    if (!userId) {
      throw new Error('User ID not found');
    }

    const { publicKey, balance } = await getUserWallet(userId);
    
    await ctx.reply(
      `Welcome to Solana Trading Bot! 🚀\n\n` +
      `💳 Your Wallet: ${publicKey.toBase58()}\n` +
      `💰 Balance: ${balance.toFixed(4)} SOL\n\n` +
      `Use /help to see available commands.`,
      { reply_markup: mainMenuKeyboard.reply_markup }
    );
  } catch (error) {
    console.error('Start command error:', error);
    await ctx.reply('Error initializing your wallet. Please try again.');
  }
};

// Error handler
export async function handleError(ctx: Context, error: Error) {
  console.error('Bot error:', error);
  await ctx.reply('An error occurred. Please try again later.');
}

/**
 * Handles incoming messages from the Telegram bot context.
 * Routes different command messages to their respective handlers based on the text content.
 * 
 * @param ctx - The Telegram bot context containing message information
 * @returns A Promise that resolves when the message has been handled
 * 
 * Commands handled:
 * - 💰 Balance: Shows wallet balance
 * - 📈 Buy: Prompts for token purchase
 * - 📉 Sell: Prompts for token sale
 * - ❓ Help: Shows help information
 * - 🔄 Refresh: Refreshes the bot state
 * 
 * @throws Will throw an error if message handling fails
 */
export const handleMessage = async (ctx: Context) => {
  // Message handling logic
if (!ctx.message || !('text' in ctx.message)) return;

const message = ctx.message as Message.TextMessage;
const text = message.text;

switch (text) {
  case '💰 Balance':
    await handleBalanceCommand(ctx);
    break;
  case '📈 Buy':
    await ctx.reply('Please enter the token address and amount to buy:\n/buy <token_address> <amount>');
    break;
  case '📉 Sell':
    await ctx.reply('Please enter the token address and amount to sell:\n/sell <token_address> <amount>');
    break;
  case '❓ Help':
    await handleStartCommand(ctx);
    break;
  case '🔄 Refresh':
    await handleStart(ctx);
    break;
  default:
    await ctx.reply('Please use the menu buttons or /help for available commands.');
}
};