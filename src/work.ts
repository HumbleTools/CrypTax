import { CsvError } from "csv-parse/.";
import { AssetWallet, BigWallet, digestBitpandaCsvTransaction, FiatWallet, initBigWallet, StackedAmount, Transaction } from "./model";
import { cents, octs, readFixesFile } from "./utils";
import { inspect } from "node:util";

export const work = (err: CsvError | undefined, rawTransactions: any[]) => {
    if (err) {
        console.log(err);
        return;
    }

    const fixes = readFixesFile('C:/data/fixes.json');

    const finalBigWallet = rawTransactions
        .map(digestBitpandaCsvTransaction)
        .map(transaction => {
            const fix = fixes.get(transaction.id);
            if (fix) {
                return {
                    ...transaction,
                    type: fix.type ?? transaction.type,
                    amountFiat: fix.amountFiat ?? transaction.amountFiat,
                    marketFiatPrice: fix.marketFiatPrice ?? transaction.marketFiatPrice
                };
            }
            return transaction;
        })
        .reduce(applyTransaction, initBigWallet('EUR'));

    console.log(inspect(finalBigWallet, { showHidden: false, depth: null, colors: true }))
    console.log(`Expected global gain = ${finalBigWallet.totalWithdrawn} - ${finalBigWallet.totalDeposited} = ${finalBigWallet.totalWithdrawn - finalBigWallet.totalDeposited}`);
    console.log(`Actual gain = ${computeGlobalGain(finalBigWallet.assetWallets)}`);
};

const applyTransaction = (bigWallet: BigWallet, transaction: Transaction): BigWallet => {
    // TODO calculate gains, investment and withdrawals for each year, and all-time
    // TODO output in the end an array to display results calculated for each year
    // TODO ajouter une génération de document expliquant chaque calcul

    console.log(transaction);
    const fiatWallet = bigWallet.fiatWallet;
    const assetWallet = getAssetWallet(bigWallet, transaction.assetName);

    switch (transaction.type) {
        case "DEPOSIT":
            // Adding fiat deposit to fiat wallet
            return {
                ...bigWallet,
                fiatWallet: {
                    ...fiatWallet,
                    amount: cents(fiatWallet.amount + transaction.amountFiat)
                },
                totalDeposited: cents(bigWallet.totalDeposited + transaction.amountFiat)
            };
        case "BUY":
            bigWallet.assetWallets.set(assetWallet.assetName, {
                ...assetWallet,
                stack: [
                    ...assetWallet.stack,
                    { // Adding new asset stack with fiatValue to assetWallet
                        quantity: transaction.amountAsset!,
                        assetFiatPrice: getSafeMarketFiatPrice(transaction)
                    }
                ]
            });
            return {
                ...bigWallet,
                fiatWallet: {
                    ...fiatWallet, // Removing transaction.amountFiat from fiatWallet
                    amount: cents(fiatWallet.amount - transaction.amountFiat)
                }
            };
        case "SELL":
            // Recovering total wallet value at the time of transaction
            const assetWalletFiatValue = getWalletFiatValue(assetWallet, getSafeMarketFiatPrice(transaction));
            console.log(`assetWalletFiatValue: ${assetWalletFiatValue}`);
            // Recovering selling price
            const sellingPrice = transaction.amountFiat;
            console.log(`sellingPrice: ${sellingPrice}`);
            // Recovering total acquisition price
            const totalAcquisitionPrice = getTotalAcquisitionPrice(assetWallet);
            console.log(`totalAcquisitionPrice: ${totalAcquisitionPrice}`);
            const bittenFromStack = calculateRemainingStack(assetWallet.stack, transaction.amountAsset!);
            // Calculating gain with Article 150 VH bis § III from french tax code
            const gain = calculateGain(sellingPrice, assetWalletFiatValue, totalAcquisitionPrice);
            // Calculating gain with my own method
            // const gain = sellingPrice - bittenFromStack.amountAquisitionPrice;
            console.log(`gain: ${gain}`);

            bigWallet.assetWallets.set(assetWallet.assetName, {
                ...assetWallet,
                fiatGains: [
                    ...assetWallet.fiatGains,
                    gain
                ],
                // Biting into assetWallet.stack to remove transaction.amountAsset
                stack: bittenFromStack.remainingStack
            });
            return {
                ...bigWallet,
                fiatWallet: {
                    ...fiatWallet, // Adding selling price to fiatWallet
                    amount: cents(fiatWallet.amount + transaction.amountFiat)
                }
            };
        case "TRANSFER":
            if ('IN' === transaction.direction) {
                bigWallet.assetWallets.set(assetWallet.assetName, {
                    ...assetWallet,
                    stack: [
                        ...assetWallet.stack,
                        { // Adding transaction.amountAsset to assetWallet.stack without removing fiat
                            quantity: transaction.amountAsset!,
                            assetFiatPrice: getSafeMarketFiatPrice(transaction)
                        }
                    ]
                });
                return {
                    ...bigWallet
                };
            } else if ('OUT' === transaction.direction) {
                // TODO but not required yet
            }
            break;
        case "WITHDRAWAL":
            // Removing fiat amount from fiatWallet to withdrawal wallet
            return {
                ...bigWallet,
                fiatWallet: {
                    ...fiatWallet,
                    amount: cents(fiatWallet.amount - transaction.amountFiat)
                },
                totalWithdrawn: cents(bigWallet.totalWithdrawn + transaction.amountFiat)
            };
    }
    throw Error(`The transaction ${transaction.type}/${transaction.direction} is not yet handled !`);
};

const getAssetWallet = (bigWallet: BigWallet, assetName: string): AssetWallet => {
    const assetWallet = bigWallet.assetWallets.get(assetName);
    return assetWallet ?? ({ assetName, stack: [], fiatGains: [] });
};

const getSafeMarketFiatPrice = (transaction: Transaction): number => {
    const marketFiatPrice = transaction.marketFiatPrice;
    if (!marketFiatPrice) {
        // Recovering precise fiat market value if zero as fiat data does not go below cents
        if (!transaction.amountAsset) {
            throw new Error('This transaction has no asset amount ! Cannot getSafeMarketFiatPrice');
        }
        return octs(transaction.amountFiat / transaction.amountAsset);
    }
    return marketFiatPrice;
};

const getWalletFiatValue = (assetWallet: AssetWallet, currentFiatPrice: number): number => assetWallet.stack
    .reduce((previousTotal: number, currentStackedAmount: StackedAmount) =>
        cents(previousTotal + currentStackedAmount.quantity * currentFiatPrice), 0);

const getTotalAcquisitionPrice = (assetWallet: AssetWallet): number => assetWallet.stack
    .reduce((previousTotal: number, currentStackedAmount: StackedAmount) => {
        if (0 === currentStackedAmount.assetFiatPrice) {
            throw new Error("assetFiatPrice should not be zero here...");
        }
        if (0 === currentStackedAmount.quantity) {
            throw new Error("quantity should not be zero here...");
        }
        return cents(previousTotal + currentStackedAmount.quantity * currentStackedAmount.assetFiatPrice);
    }, 0);

const calculateGain = (sellingPrice: number, assetWalletFiatValue: number, totalAcquisitionPrice: number) => {
    // FORMULE : gain = prix de cession - [prix total d'acquisition * (prix de cession / valeur globale du portefeuille)]
    return cents(sellingPrice - totalAcquisitionPrice * sellingPrice / assetWalletFiatValue);
}

interface RemainingStackWithRemovedAmount {
    remainingStack: StackedAmount[];
    removedAmount: number;
    amountAquisitionPrice: number;
}

export const calculateRemainingStack = (stack: StackedAmount[], amountToRemove: number): RemainingStackWithRemovedAmount => {
    // Use Shift to retrieve first in line, because assets are added at the end of the stack and oldest assets are sold first (PEPS/FIFO)
    let newStack = [...stack];
    let removedStack: StackedAmount[] = [];
    let amountLeftToRemove = amountToRemove;
    let infiniteLoopGuardian = 0;
    do {
        infiniteLoopGuardian++;
        if (infiniteLoopGuardian > 999) {
            throw new Error("Huh-oh... been there too many times ! Incorrect computing...");
        }
        const popped = newStack.shift();
        if (!popped) {
            throw new Error(`Not enough funds !? amountToRemove=${amountLeftToRemove} still`);
        }
        const leftOver = octs(popped.quantity - amountLeftToRemove);
        if (leftOver > 0) {
            newStack.unshift({
                assetFiatPrice: popped.assetFiatPrice,
                quantity: leftOver
            });
            removedStack.push({
                assetFiatPrice: popped.assetFiatPrice,
                quantity: amountLeftToRemove
            });
            amountLeftToRemove = 0;
        } else {
            amountLeftToRemove = Math.abs(leftOver);
            removedStack.push(popped);
        }
    } while (amountLeftToRemove > 0);
    return {
        remainingStack: newStack,
        removedAmount: amountToRemove,
        amountAquisitionPrice: getTotalAcquisitionPrice({ stack: removedStack } as AssetWallet)
    };
};

const computeGlobalGain = (assets: Map<string, AssetWallet>): number => {
    let total = 0;
    assets.forEach(wallet => {
        total += wallet.fiatGains.reduce((previous, current) => previous + current, 0);
    });
    return total;
};

export const Testing = {
    getSafeMarketFiatPrice,
    getWalletFiatValue,
    getTotalAcquisitionPrice,
    calculateGain
};
