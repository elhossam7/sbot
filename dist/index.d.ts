import { Telegraf, Context } from 'telegraf';
import { Connection } from '@solana/web3.js';
declare const bot: Telegraf<Context<import("telegraf/types.js").Update>>;
declare const connection: Connection;
export { bot, connection };
