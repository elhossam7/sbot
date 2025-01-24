import { registerCommands } from './commands';
import { handleMessage } from './handlers';
import { TelegramBot } from 'node-telegram-bot-api';
import { TELEGRAM_BOT_TOKEN } from '../config';

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

export const startBot = () => {
    registerCommands(bot);
    bot.on('message', handleMessage);
    console.log('Bot is running...');
};