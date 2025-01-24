export declare class WalletService {
    private connection;
    constructor(endpoint?: string);
    generateNewWallet(userId: string): Promise<string>;
    getWallet(userId: string): Promise<{
        publicKey: string;
        privateKey: string;
    } | null>;
    initializeWallet(publicKey: string): Promise<boolean>;
    getWalletInfo(publicKey: string): Promise<{
        publicKey: string;
        balance: number;
        createdAt: Date;
    }>;
    createWallet(userId: string, label?: string): Promise<{
        userId: string;
        id: string;
        address: string;
        createdAt: Date;
        label: string | null;
        updatedAt: Date;
    }>;
    findWalletByAddress(address: string): Promise<{
        userId: string;
        id: string;
        address: string;
        createdAt: Date;
        label: string | null;
        updatedAt: Date;
    } | null>;
    findWalletsByUserId(userId: string): Promise<{
        userId: string;
        id: string;
        address: string;
        createdAt: Date;
        label: string | null;
        updatedAt: Date;
    }[]>;
    deleteWallet(address: string): Promise<{
        userId: string;
        id: string;
        address: string;
        createdAt: Date;
        label: string | null;
        updatedAt: Date;
    }>;
    updateWalletLabel(address: string, label: string): Promise<{
        userId: string;
        id: string;
        address: string;
        createdAt: Date;
        label: string | null;
        updatedAt: Date;
    }>;
}
