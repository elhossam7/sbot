export function formatAmount(amount: number): string {
    return amount.toFixed(2);
}

export function parseEnv(variable: string, defaultValue: string): string {
    return process.env[variable] || defaultValue;
}