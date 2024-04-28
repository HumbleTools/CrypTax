import figlet from "figlet";
import {parse} from 'csv-parse';
import {readLinesFromFile as ReadLinesFromFile} from "./utils";
import {work as Work} from "./work";

console.log(figlet.textSync("CrypTax"));

const rawCsv: string = ReadLinesFromFile('C:/data/data.csv');

parse(rawCsv, {
    columns: true,
}, Work);
