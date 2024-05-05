import { CsvError } from "csv-parse/.";
import { AssetWallet, digestBitpandaCsvTransaction, FiatWallet, StackedAmount, Transaction } from "./model";
import { prodCents, sumCents, sumOcts } from "./utils";

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
    // TODO add unit tests to secure the code
    // TODO calculate gains, investment and withdrawals for each year, and all-time
    // TODO output in the end an array to display results calculated for each year

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
                    amount: sumCents(fiatWallet.amount, -1 * transaction.amountFiat)
                }
            };
        case "SELL":
            // Recovering total wallet value at the time of transaction
            const assetWalletFiatValue = getWalletFiatValue(assetWallet!, transaction.marketFiatPrice!);
            console.log(`assetWalletFiatValue: ${assetWalletFiatValue}`);
            // Recovering selling price
            const sellingPrice = transaction.amountFiat;
            console.log(`sellingPrice: ${sellingPrice}`);
            // Recovering total acquisition price
            const totalAcquisitionPrice = getTotalAcquisitionPrice(assetWallet!);
            console.log(`totalAcquisitionPrice: ${totalAcquisitionPrice}`);
            // Calculating gain with Article 150 VH bis § III from french tax code
            const gain = calculateGain(sellingPrice, assetWalletFiatValue, totalAcquisitionPrice);
            console.log(`gain: ${gain}`);
            return {
                ...bigWallet,
                [transaction.assetName]: {
                    assetName: assetWallet!.assetName,
                    fiatGains: [
                        ...assetWallet!.fiatGains,
                        gain
                    ],
                    // Biting into assetWallet.stack to remove transaction.amountAsset
                    stack: calculateRemainingStack(assetWallet!.stack, transaction.amountAsset!)
                },
                EUR: {
                    ...fiatWallet, // Adding selling price to fiatWallet
                    amount: sumCents(fiatWallet.amount, transaction.amountFiat)
                }
            };
        case "TRANSFER":
            if('IN'===transaction.direction){
                return {
                    ...bigWallet,
                    [transaction.assetName]: {
                        ...assetWallet,
                        stack: [
                            ...assetWallet!.stack,
                            { // Adding transaction.amountAsset to assetWallet.stack without removing fiat
                                quantity: transaction.amountAsset,
                                assetFiatPrice: transaction.marketFiatPrice
                            }
                        ]
                    },
                };
            } else if('OUT'===transaction.direction){
                // TODO but not required yet
            }
            break;
        case "WITHDRAWAL":
            // Removing fiat amount to a withdrawal wallet
            const withdrawalWallet = getWithdrawalWallet(bigWallet)
            return {
                ...bigWallet,
                "WEURO": {
                    ...withdrawalWallet,
                    amount: sumCents(withdrawalWallet.amount, transaction.amountFiat)
                }
            };
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
const getWithdrawalWallet = (bigWallet: any) => {
    const withdrawalWallet = bigWallet['WEUR'] as FiatWallet;
    return withdrawalWallet ?? { fiatName: 'EUR', amount: 0 };
};

const getWalletFiatValue = (assetWallet: AssetWallet, currentFiatPrice: number): number => assetWallet.stack
    .reduce((previousTotal: number, currentStackedAmount: StackedAmount) => {
        const currentValue = prodCents(currentStackedAmount.quantity, currentFiatPrice);
        return sumCents(previousTotal, currentValue);
    }, 0);

const getTotalAcquisitionPrice = (assetWallet: AssetWallet): number => assetWallet.stack
.reduce((previousTotal: number, currentStackedAmount: StackedAmount) => {
    const currentValue = prodCents(currentStackedAmount.quantity, currentStackedAmount.assetFiatPrice);
    return sumCents(previousTotal, currentValue);
}, 0);

const calculateGain = (sellingPrice: number, assetWalletFiatValue: number, totalAcquisitionPrice: number) => {
    // FORMULE : gain = prix de cession - [prix total d'acquisition * (prix de cession / valeur globale du portefeuille)]
    return sumCents(sellingPrice, -1 * totalAcquisitionPrice * sellingPrice / assetWalletFiatValue);
}

const calculateRemainingStack = (stack: StackedAmount[], amountAsset: number) => {
    // Use Shift to retrieve first in line, because assets are added at the end of the stack and oldest assets are sold first (PEPS/FIFO)
    let newStack = [...stack];
    let amountToRemove = amountAsset;
    let infiniteLoopGuardian = 0;
    do {
        infiniteLoopGuardian++;
        if(infiniteLoopGuardian > 999){
            throw new Error("Huh-oh... been there too many times ! Incorrect computing...");
        }
        const popped = newStack.shift();
        if(!popped){
            throw new Error("Not enough funds !? Incorrect computing...");
        }
        amountToRemove = sumOcts(amountToRemove, -1 * popped.quantity);
        if(amountToRemove < 0){
            newStack.unshift({
                assetFiatPrice: popped.assetFiatPrice,
                quantity: -1 * amountToRemove
            });
        }
    } while(amountToRemove <= 0);
    return newStack;
};
