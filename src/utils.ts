import * as fs from 'fs';

export const readLinesFromFile: (filePath: string) => string = (filePath) =>
    fs.readFileSync(filePath, 'utf8')
        .split('\n')
        .slice(5, 11)
        .join('\n');

// https://medium.com/@tbreijm/exact-calculations-in-typescript-node-js-b7333803609e
const round = (n: number, k: number, resolution: number): number => {
    const precision = Math.pow(10, Math.trunc(resolution));
    return Math.round(
        Math.round(((n + Number.EPSILON) * precision) / k) * k
    ) / precision;
};

const cents = (value: number): number => round(value, 1, 2);
const octs = (value: number): number => round(value, 1, 8);

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);
export const sumCents = (values: number[]): number => cents(sum(values));
export const sumOcts = (values: number[]): number => octs(sum(values));

const prod = (values: number[]): number => values.reduce((a, b) => a * b, 1);
export const prodCents = (values: number[]): number => cents(prod(values));
export const prodOcts = (values: number[]): number => octs(prod(values));

export const div = (a: number, b: number): number => a / b;
export const divCents = (a: number, b: number): number => cents(div(a, b));
export const divOcts = (a: number, b: number): number => octs(div(a, b));
