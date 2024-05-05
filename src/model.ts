import { getNumberOrNull, getNumberOrZero } from "./utils";

export interface Transaction {
    date: Date;
    type: 'DEPOSIT' | 'BUY' | 'SELL' | 'TRANSFER' | 'WITHDRAWAL';
    direction: 'IN' | 'OUT';
    assetName: string;
    amountAsset: number | null;
    amountFiat: number;
    marketFiatPrice: number | null;
}

export interface StackedAmount {
    quantity: number;
    assetFiatPrice: number;
}

export interface AssetWallet {
    assetName: string;
    stack: StackedAmount[];
    fiatGains: number[];
}

export interface FiatWallet {
    fiatName: string;
    amount: number;
}

export interface BigWallet {
    fiatWallet: FiatWallet;
    totalDeposited: number;
    totalWithdrawn: number;
    assetWallets: Map<string, AssetWallet>;
}

export const initBigWallet = (fiatName: string): BigWallet => ({
    fiatWallet: {
        fiatName,
        amount: 0
    },
    totalDeposited: 0,
    totalWithdrawn: 0,
    assetWallets: new Map<string, AssetWallet>()
});

export const digestBitpandaCsvTransaction = (obj: any): Transaction => ({
    date: new Date(obj['Timestamp']),
    type: obj['Transaction Type'].toUpperCase(),
    direction: 'incoming' === obj['In/Out'] ? 'IN' : "OUT",
    assetName: obj['Asset'],
    amountAsset: getNumberOrNull(obj['Amount Asset']),
    amountFiat: getNumberOrZero(obj['Amount Fiat']),
    marketFiatPrice: getNumberOrNull(obj['Asset market price'])
});
