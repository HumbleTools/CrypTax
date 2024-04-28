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
    // gain = prix de cession - [prix total d'acquisition * (prix de cession / valeur globale du portefeuille)]
    // gains/pertes à calculer sur les ventes = SELL puis appliquer la transaction sur le portefeuille
    // pour les autres types, simplement appliquer la transaction sur le portefeuille

    console.log(transaction);
    const fiatWallet = getFiatWallet(bigWallet);
    const assetWallet = getAssetWallet(bigWallet, transaction.assetName);

    switch (transaction.type) {
        case "DEPOSIT":
            return {
                ...bigWallet,
                EUR: {
                    ...fiatWallet,
                    amount: sumCents(fiatWallet.amount, transaction.amountFiat)
                }
            };
        case "BUY":
            // TODO apply transaction to assetWallet and fiatWallet
            return {
                ...bigWallet,
                [transaction.assetName]: {
                    ...assetWallet
                },
                EUR: {
                    ...fiatWallet
                }
            };
        case "SELL":
            const assetWalletFiatValue = getWalletFiatValue(assetWallet!);
            console.log(`assetWalletFiatValue: ${assetWalletFiatValue}`);
            break;
        case "TRANSFER":
            break;
        case "WITHDRAWAL":
            break;
    }
    throw Error("should not go there yet !");
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
