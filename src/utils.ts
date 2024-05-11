import * as fs from 'fs';
import { Fix } from './model';

export const readLinesFromCsvFile: (filePath: string) => string = (filePath) =>
    fs.readFileSync(filePath, 'utf8')
        .split('\n')
        .slice(5)
        .join('\n');

export const readFixesFile = (filePath: string): Map<string, Fix> => {
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const resultMap = new Map<string, Fix>();
    for (const id of Object.keys(raw)) {
        resultMap.set(id, raw[id]);
    }
    return resultMap;
};

export const getNumberOrZero = (value: string): number => getNumberOrDefault(value, 0) as number;
export const getNumberOrNull = (value: string): number | null => getNumberOrDefault(value, null);
const getNumberOrDefault = (value: string, defaultValue: number | null) =>
    '-' === value || !value ? defaultValue : parseFloat(value);

// https://medium.com/@tbreijm/exact-calculations-in-typescript-node-js-b7333803609e
const round = (n: number, k: number, resolution: number): number => {
    const precision = Math.pow(10, Math.trunc(resolution));
    const result = Math.round(
        Math.round(((n + Number.EPSILON) * precision) / k) * k
    ) / precision;
    if (Number.isNaN(result)) {
        throw new Error("NaN encountered ! Incorrect computing...");
    }
    return result;
};

export const cents = (value: number): number => round(value, 1, 2);
export const octs = (value: number): number => round(value, 1, 8);

const sum = (...values: number[]) => values.reduce((a, b) => a + b, 0);
const prod = (...values: number[]): number => values.reduce((a, b) => a * b, 1);
const div = (a: number, b: number): number => a / b;

export const Testing = {
    cents,
    octs
}