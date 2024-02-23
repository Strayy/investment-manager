import { useState } from "react";

import "../styles/components/_addTransaction.scss";

function AddTransaction({ transactionMode }: { transactionMode: boolean }) {
    const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
    const [amount, setAmount] = useState<string>("");
    const [marketPrice, setMarketPrice] = useState<string>("");

    return (
        <div className='add-transaction-dialog-content'>
            <h1>Add Transaction</h1>
            <input type='text' placeholder='Search Investment...' />
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
            <div className='total'>
                <p>Portfolio Summary:</p>
                <span>
                    <p>$50,000</p>
                    <i className='fi fi-rr-arrow-right'></i>
                    <p className={transactionMode ? "buy-style" : "sell-style"}>$10,000</p>
                </span>
            </div>
            <div className='add-trade-button'>
                <button className={transactionMode ? "buy-style" : "sell-style"}>
                    {transactionMode ? "Create Buy Transaction" : "Create Sell Transaction"}
                </button>
            </div>
        </div>
    );
}

export default AddTransaction;
