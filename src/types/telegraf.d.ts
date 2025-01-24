
import { Context as TelegrafContext } from 'telegraf';

declare module 'telegraf' {
  interface Context extends TelegrafContext {
    wallet?: {
      address: string;
      balance: number;
    };
  }
}