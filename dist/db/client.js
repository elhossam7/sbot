import { PrismaClient } from '@prisma/client';
const prisma = global.prisma || new PrismaClient({
    errorFormat: 'minimal',
    log: ['error', 'warn'],
});
if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}
export default prisma;
//# sourceMappingURL=client.js.map