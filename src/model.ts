import { getNumberOrNull, getNumberOrZero } from "./utils";

type TransactionType = 'DEPOSIT' | 'BUY' | 'SELL' | 'TRANSFER' | 'WITHDRAWAL';
type TransactionDirection = 'IN' | 'OUT';

export interface Fix {
    type: TransactionType | null;
    amountFiat: number | null;
    marketFiatPrice: number | null;
}

export interface Transaction {
    id: string;
    date: Date;
    type: TransactionType;
    direction: TransactionDirection;
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
    fiatGains: FiatGain[];
}

export interface FiatGain {
    gain: number;
    fiscalYear: number;
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

export interface FinalGains {
    allTime: GainLoss;
    yearlyGains: Map<number, GainLoss>;
}

export interface GainLoss {
    gain: number;
    loss: number;
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
    id: obj['Transaction ID'],
    date: new Date(obj['Timestamp']),
    type: obj['Transaction Type'].toUpperCase(),
    direction: 'incoming' === obj['In/Out'] ? 'IN' : "OUT",
    assetName: obj['Asset'],
    amountAsset: getNumberOrNull(obj['Amount Asset']),
    amountFiat: getNumberOrZero(obj['Amount Fiat']),
    marketFiatPrice: getNumberOrNull(obj['Asset market price']),
});
