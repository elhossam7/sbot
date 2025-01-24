export function formatAmount(amount) {
    return amount.toFixed(2);
}
export function parseEnv(variable, defaultValue) {
    return process.env[variable] || defaultValue;
}
//# sourceMappingURL=helpers.js.map