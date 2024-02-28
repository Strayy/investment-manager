import { useState } from "react";

import "../styles/components/_addTransaction.scss";

function AddTransaction({
    transactionMode,
    successAction,
    totalPortfolioValue,
}: {
    transactionMode: boolean;
    successAction: () => void;
    totalPortfolioValue?: number | null;
}) {
    const [stockId, setStockId] = useState<string>("");
    const [amount, setAmount] = useState<string>("");
    const [marketPrice, setMarketPrice] = useState<string>("");
    const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);

    async function addTransaction() {
        try {
            setIsLoading(true);

            const request = await fetch(
                `${process.env.REACT_APP_SERVER_ADDRESS}portfolio/addTrade`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        userId: "TEST-USER-ID",
                        stockId: stockId,
                        action: transactionMode ? "BUY" : "SELL",
                        date: date,
                        price: marketPrice,
                        amount: amount,
                    }),
                },
            );

            if (request.status !== 200) {
                throw new Error();
            } else {
                setError(false);
            }

            setTimeout(() => {
                setIsLoading(false);
                successAction();
            }, 3000);
        } catch (err) {
            setError(true);
        }
    }

    return (
        <div className='add-transaction-dialog-content'>
            <h1>Add Transaction</h1>
            <input
                type='text'
                placeholder='Search Investment...'
                value={stockId}
                onChange={(e) => setStockId(e.target.value)}
            />
            <div className='input-fields'>
                <div>
                    <p>Market Price</p>
                    <div>
                        <span className='market-price-symbol'>$</span>
                        <input
                            type='text'
                            placeholder='0.00'
                            value={marketPrice}
                            onChange={(e) => setMarketPrice(e.target.value.replace(/[^0-9.]/g, ""))}
                        />
                    </div>
                </div>
                <div>
                    <p>Amount</p>
                    <div>
                        <input
                            type='text'
                            placeholder='1'
                            value={amount}
                            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                        />
                    </div>
                </div>
                <div>
                    <p>Date</p>
                    <div>
                        <input type='date' value={date} onChange={(e) => setDate(e.target.value)} />
                    </div>
                </div>
            </div>

            {totalPortfolioValue !== null && totalPortfolioValue !== undefined && (
                <div className='total'>
                    <p>Portfolio Summary:</p>
                    <span>
                        <p>
                            {new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: "USD",
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            }).format(totalPortfolioValue)}
                        </p>
                        <i className='fi fi-rr-arrow-right'></i>
                        <p className={transactionMode ? "buy-style" : "sell-style"}>
                            {new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: "USD",
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            }).format(
                                transactionMode
                                    ? totalPortfolioValue + Number(marketPrice) * Number(amount)
                                    : totalPortfolioValue - Number(marketPrice) * Number(amount),
                            )}
                        </p>
                    </span>
                </div>
            )}

            <div className='add-trade-button'>
                {!isLoading ? (
                    <button
                        className={transactionMode ? "buy-style" : "sell-style"}
                        onClick={addTransaction}
                    >
                        {transactionMode ? "Create Buy Transaction" : "Create Sell Transaction"}
                    </button>
                ) : (
                    <div className={transactionMode ? "spinner buy-style" : "spinner sell-style"}>
                        <i className='fi fi-br-spinner'></i>
                    </div>
                )}
            </div>
            {error && (
                <div className='add-trade-error'>
                    There was an error adding trade. Please try again.
                </div>
            )}
        </div>
    );
}

export default AddTransaction;
