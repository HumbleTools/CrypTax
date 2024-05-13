import { describe, test, expect } from '@jest/globals';
import { Testing, calculateRemainingStack } from '../src/work';
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

    test.each`
        sellingPrice | assetWalletFiatValue | totalAcquisitionPrice | expected
        ${100}       | ${200}               | ${200}                | ${0}
        ${100}       | ${200}               | ${100}                | ${50}
        ${100}       | ${200}               | ${400}                | ${-100}
        ${50.23}     | ${60.45}             | ${75.51}              | ${-12.51}
    `('calculateGain($sellingPrice, $assetWalletFiatValue, $totalAcquisitionPrice) should return $expected', ({ sellingPrice, assetWalletFiatValue, totalAcquisitionPrice, expected }) => {
        expect(Testing.calculateGain(sellingPrice, assetWalletFiatValue, totalAcquisitionPrice)).toBe(expected);
    });

});

describe('Testing calculateRemainingStack', () => {
    const input: StackedAmount[] = [
        { quantity: 3, assetFiatPrice: 0.21 },
        { quantity: 1, assetFiatPrice: 0.22 },
        { quantity: 2, assetFiatPrice: 0.23 }
    ];

    test('calculateRemainingStack empties the stack', () => {
        const result = calculateRemainingStack(input, 6);
        expect(result).toStrictEqual({
            remainingStack: [],
            removedAmount: 6,
            amountAquisitionPrice: 1.31
        });
    });

    test('calculateRemainingStack cuts the stack evenly', () => {
        const result = calculateRemainingStack(input, 4);
        expect(result).toStrictEqual({
            remainingStack: [
                { quantity: 2, assetFiatPrice: 0.23 }
            ],
            removedAmount: 4,
            amountAquisitionPrice: 0.85
        });
    });

    test('calculateRemainingStack cuts the stack in the middle of an amount', () => {
        const result = calculateRemainingStack(input, 3.2);
        expect(result).toStrictEqual({
            remainingStack: [
                { quantity: 0.8, assetFiatPrice: 0.22 },
                { quantity: 2, assetFiatPrice: 0.23 }
            ],
            removedAmount: 3.2,
            amountAquisitionPrice: 0.67
        });
    });

    describe('Testing computeGains', () => {
        test('computeGains should return correcty formed gains', () => {
            const result = Testing.computeGains(new Map([
                ['PLOP', {
                    assetName: 'PLOP',
                    fiatGains: [
                        { gain: -1, fiscalYear: 3025 },
                        { gain: 2.36, fiscalYear: 3025 },
                        { gain: -0.2, fiscalYear: 3026 },
                    ],
                    stack: []
                }],
                ['BOUNCE', {
                    assetName: 'BOUNCE',
                    fiatGains: [
                        { gain: -0.1, fiscalYear: 3025 },
                        { gain: 2, fiscalYear: 3026 },
                        { gain: 3.52, fiscalYear: 3027 }
                    ],
                    stack: []
                }]
            ]));
            expect(result).toStrictEqual({
                allTime: {
                    gain: 7.88,
                    loss: -1.3
                },
                yearlyGains: new Map([
                    [3025, {
                        gain: 2.36,
                        loss: -1.1
                    }],
                    [3026, {
                        gain: 2,
                        loss: -0.2
                    }],
                    [3027, {
                        gain: 3.52,
                        loss: 0
                    }]
                ])
            });
        });
    });
});