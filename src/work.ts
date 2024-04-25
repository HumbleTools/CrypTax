import { CsvError } from "csv-parse/.";

export const work = (err: CsvError | undefined, transactions: any) => {
    if (err) {
        console.log(err);
        return;
    }
    console.log(transactions);
};
