import {CsvError} from "csv-parse/.";
import {AssetWallet, digestBitpandaCsvTransaction, Transaction} from "./model";

export const work = (err: CsvError | undefined, rawTransactions: any[]) => {
    if (err) {
        console.log(err);
        return;
    }

    let bigWallet = {} as any;

    rawTransactions
        .map(digestBitpandaCsvTransaction)
        .forEach(transaction => {
            console.log(transaction);
            bigWallet = {
                ...bigWallet,
                [transaction.asset] : applyTransaction(transaction, bigWallet[transaction.asset] as AssetWallet)
            }
        });
};

const applyTransaction = (transaction: Transaction, bigWalletElement: AssetWallet): AssetWallet => {
    // TODO digest transaction here
    // TODO use push to put into queue array, shift to retrieve first in line, unshift to put back in front of queue
    switch(transaction.type){
        
    }
    return bigWalletElement;
}
