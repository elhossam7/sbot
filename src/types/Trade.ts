export interface Trade {
  price: number;
  size: number;
  side: 'buy' | 'sell';
  timestamp: Date;
}
