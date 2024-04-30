import { CsvError } from "csv-parse/.";
import { AssetWallet, digestBitpandaCsvTransaction, FiatWallet, StackedAmount, Transaction } from "./model";
import { prodCents, sumCents } from "./utils";

export const work = (err: CsvError | undefined, rawTransactions: any[]) => {
    if (err) {
        console.log(err);
        return;
    }

    const finalBigWallet = rawTransactions
        .map(digestBitpandaCsvTransaction)
        .reduce(applyTransaction, {} as any);

    console.log(finalBigWallet);
};

const applyTransaction = (bigWallet: any, transaction: Transaction): any => {
    // TODO use push to put into queue array, shift to retrieve first in line, unshift to put back in front of queue
    // TODO add tests 
    // TODO calculate gains, investment and withdrawals for each year, and all-time.

    console.log(transaction);
    const fiatWallet = getFiatWallet(bigWallet);
    const assetWallet = getAssetWallet(bigWallet, transaction.assetName);

    switch (transaction.type) {
        case "DEPOSIT":
            // Adding fiat deposit to fiat wallet
            return {
                ...bigWallet,
                EUR: {
                    ...fiatWallet,
                    amount: sumCents(fiatWallet.amount, transaction.amountFiat)
                }
            };
        case "BUY":
            return {
                ...bigWallet,
                [transaction.assetName]: {
                    ...assetWallet,
                    stack: [
                        ...assetWallet!.stack,
                        { // Adding new asset stack with fiatValue to assetWallet
                            quantity: transaction.amountAsset,
                            assetFiatPrice: transaction.marketFiatPrice
                        }
                    ]
                },
                EUR: {
                    ...fiatWallet, // Removing transaction.amountFiat from fiatWallet
                    amount: sumCents(fiatWallet.amount, -1*transaction.amountFiat)
                }
            };
        case "SELL":
            // Calculating assetWallet value before transaction, at the time of transaction
            const assetWalletFiatValue = getWalletFiatValue(assetWallet!);
            console.log(`assetWalletFiatValue: ${assetWalletFiatValue}`);
            // TODO adding transaction.amountFiat to fiatWallet
            // TODO biting into assetWallet.stack to remove transaction.amountAsset & recovering acquisition price 
            // TODO calculating gain with Article 150 VH bis § III from french tax code
            // gain = prix de cession - [prix total d'acquisition * (prix de cession / valeur globale du portefeuille)]
            break;
        case "TRANSFER":
            if('IN'===transaction.direction){
                // TODO adding transaction.amountAsset to assetWallet.stack
            } else if('OUT'===transaction.direction){
                // TODO but not required yet
            }
            break;
        case "WITHDRAWAL":
            // TODO removing fiat amount to a withdrawal wallet
            break;
    }
    throw Error(`The transaction ${transaction.type}/${transaction.direction} is not yet handled !`);
};

const getFiatWallet = (bigWallet: any): FiatWallet => {
    const fiatWallet = bigWallet['EUR'] as FiatWallet;
    return fiatWallet ?? { fiatName: 'EUR', amount: 0 };
};
const getAssetWallet = (bigWallet: any, assetName: string): AssetWallet | undefined => {
    const assetWallet = bigWallet[assetName] as AssetWallet;
    return assetName==='EUR' ? undefined : assetWallet ?? { assetName, stack: [], fiatGains: [] };
};

const getWalletFiatValue = (assetWallet: AssetWallet): number => assetWallet.stack
    .reduce((previousTotal: number, currentStackedAmount: StackedAmount) => {
        const currentValue = prodCents(currentStackedAmount.quantity, currentStackedAmount.assetFiatPrice);
        return sumCents(previousTotal, currentValue);
    }, 0);
