import * as fs from 'fs';

export const readLinesFromFile: (filePath: string) => string = (filePath) =>
fs.readFileSync(filePath, 'utf8')
    .split('\n')
    .slice(5, 11)
    .join('\n');
