import { describe, test, expect } from '@jest/globals';
import { Testing } from '../src/work';
import { AssetWallet, StackedAmount, Transaction } from '../src/model';

describe('Testing work functions', () => {

    test.each`
        amountFiat | amountAsset        | expected
        ${9.76}    | ${954072.09519209} | ${0.00001023}
        ${1.39}    | ${48969.76994983}  | ${0.00002838}
        ${0.02}    | ${1972.20520260}   | ${0.00001014}
    `('getSafeMarketFiatPrice($amountFiat/$amountAsset) should return $expected', ({ amountFiat, amountAsset, expected }) => {
        const transaction = {
            amountFiat,
            amountAsset
        } as Transaction;
        expect(Testing.getSafeMarketFiatPrice(transaction)).toBe(expected);
    });

    test('getWalletFiatValue should return zero for empty fiat wallets', () => {
        const wallet = { stack: [] as StackedAmount[] } as AssetWallet;
        expect(Testing.getWalletFiatValue(wallet, 2)).toBe(0);
    });

    test('getWalletFiatValue should return the correct value', () => {
        const wallet = {
            stack: [
                { quantity: 954072.09519209, assetFiatPrice: 0.00001023 },
                { quantity: 48969.76994983, assetFiatPrice: 0.00002838 },
                { quantity: 1972.20520260, assetFiatPrice: 0.00001014 }
            ] as StackedAmount[]
        } as AssetWallet;
        expect(Testing.getWalletFiatValue(wallet, 0.00001234)).toBe(12.39);
    });

    test('getTotalAcquisitionPrice should return zero when wallet is empty', () => {
        const wallet = {
            stack: [] as StackedAmount[]
        } as AssetWallet;
        expect(Testing.getTotalAcquisitionPrice(wallet)).toBe(0);
    });

    test('getTotalAcquisitionPrice should return the correct value', () => {
        const wallet = {
            stack: [
                { quantity: 954072.09519209, assetFiatPrice: 0.00001023 },
                { quantity: 48969.76994983, assetFiatPrice: 0.00002838 },
                { quantity: 1972.20520260, assetFiatPrice: 0.00001014 }
            ] as StackedAmount[]
        } as AssetWallet;
        expect(Testing.getTotalAcquisitionPrice(wallet)).toBe(11.17);
    });

});