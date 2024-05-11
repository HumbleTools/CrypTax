import { describe, test, expect } from '@jest/globals';
import { Testing } from '../src/utils';

describe('Testing rounding math functions', () => {
    test.each`
        number   | expected
        ${1.330} | ${1.33}
        ${1.331} | ${1.33}
        ${1.334} | ${1.33}
        ${1.335} | ${1.34}
        ${1.336} | ${1.34}
        ${1.339} | ${1.34}
    `('cents($number) should return $expected', ({ number, expected }) => {
        expect(Testing.cents(number)).toBe(expected);
    });

    test.each`
        number         | expected
        ${1.333333330} | ${1.33333333}
        ${1.333333331} | ${1.33333333}
        ${1.333333334} | ${1.33333333}
        ${1.333333335} | ${1.33333334}
        ${1.333333336} | ${1.33333334}
        ${1.333333339} | ${1.33333334}
    `('octs($number) should return $expected', ({ number, expected }) => {
        expect(Testing.octs(number)).toBe(expected);
    });
});
