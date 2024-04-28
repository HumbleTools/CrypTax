import { getNumberOrNull, getNumberOrZero } from "./utils";

export const DATA_SAMPLE = "\"Transaction ID\",Timestamp,\"Transaction Type\",In/Out,\"Amount Fiat\",Fiat,\"Amount Asset\",Asset,\"Asset market price\",\"Asset market price currency\",\"Asset class\",\"Product ID\",Fee,\"Fee asset\",Spread,\"Spread Currency\",\"Tax Fiat\"\n" +
    "eeaf0A64,2022-02-07T12:30:52+01:00,deposit,incoming,25.00,EUR,-,EUR,-,-,Fiat,-,0.00000000,EUR,-,-,0.00\n" +
    "5eff0Ae2,2022-02-09T06:45:33+01:00,deposit,incoming,50.00,EUR,-,EUR,-,-,Fiat,-,0.00000000,EUR,-,-,0.00\n" +
    "9e5e0A21,2022-02-09T08:18:31+01:00,buy,outgoing,1.39,EUR,48969.76994983,SHIB,0.00,EUR,Fiat,193,-,-,-,-,0.00\n" +
    "7e2d0Ab4,2022-02-09T08:18:31+01:00,buy,outgoing,1.78,EUR,0.03570817,LUNC,49.85,EUR,Fiat,133,-,-,-,-,0.00";

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

export const digestBitpandaCsvTransaction = (obj: any): Transaction => ({
    date: new Date(obj['Timestamp']),
    type: obj['Transaction Type'].toUpperCase(),
    direction: 'incoming' === obj['In/Out'] ? 'IN' : "OUT",
    assetName: obj['Asset'],
    amountAsset: getNumberOrNull(obj['Amount Asset']),
    amountFiat: getNumberOrZero(obj['Amount Fiat']),
    marketFiatPrice: getNumberOrNull(obj['Asset market price'])
});
