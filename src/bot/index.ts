import { TELEGRAM_BOT_TOKEN } from '../config.js';
import { Telegraf } from 'telegraf';
import { registerCommands } from './commands.js';
import { handleMessage } from './handlers.js';

const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

export const startBot = () => {
    registerCommands(bot);
    bot.on('message', handleMessage);
    console.log('Bot is running...');
    bot.launch();
};