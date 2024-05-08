import { describe, test, expect } from '@jest/globals';
import { Testing } from '../src/work';
import { Transaction } from '../src/model';

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
});