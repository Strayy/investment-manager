import { useEffect, useRef, useState } from "react";

import "../styles/components/_addTransaction.scss";
import { FuzzySearchResponse } from "../types/fuzzySearchResponseData";

function AddTransaction({
    transactionMode,
    successAction,
    totalPortfolioValue,
}: {
    transactionMode: boolean;
    successAction: () => void;
    totalPortfolioValue?: number | null;
}) {
    // State for input fields
    const [stockSearch, setStockSearch] = useState<string>("");
    const [amount, setAmount] = useState<string>("");
    const [marketPrice, setMarketPrice] = useState<string>("");
    const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);

    // Handle state for stock search functionality.
    const [searchActive, setSearchActive] = useState<boolean>(false);
    const [fuzzySearchData, setFuzzySearchData] = useState<FuzzySearchResponse[] | undefined>();
    const [selectedStockData, setSelectedStockData] = useState<null | string>(null);

    // Handle state for conditionally rendering loading spinner and error message.
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);

    // Handle abort controller for cancelling requests on update.
    const abortControllerRef = useRef<null | AbortController>(null);

    // Hide fuzzy search results if a stock is selected from the list by a user.
    useEffect(() => {
        setSearchActive(false);
    }, [selectedStockData]);

    // When changing the stock search input, fuzzy search database of stocks.
    useEffect(() => {
        setSelectedStockData(null);

        // Fuzzy search database with abort controller to handle input changes and pending requests.
        const searchRequest = async () => {
            try {
                const newAbortController = new AbortController();

                abortControllerRef.current = newAbortController;

                const response = await fetch(
                    `${process.env.REACT_APP_SERVER_ADDRESS}stock/searchProfile`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        signal: newAbortController.signal,
                        body: JSON.stringify({ searchTerm: stockSearch }),
                    },
                );

                if (newAbortController.signal.aborted) {
                    return;
                }

                setFuzzySearchData(await response.json());
                setSearchActive(true);
            } catch (error) {
                return;
            }
        };

        // Only search stocks if input has text or numbers.
        if (stockSearch.trim() !== "") {
            searchRequest();
        } else {
            setSearchActive(false);
        }

        // Abort pending requests if input is updated. Cancels all existing requests so that only the most recent is allowed to run.
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [stockSearch]);

    // Add transaction to the user's account.
    async function addTransaction() {
        try {
            setIsLoading(true);

            if (date && marketPrice && amount && selectedStockData) {
                const [exchange, ticker] = selectedStockData.split(":");

                const request = await fetch(
                    `${process.env.REACT_APP_SERVER_ADDRESS}portfolio/addTrade`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            userId: "TEST-USER-ID",
                            stockId: `${exchange.trim()}_${ticker.trim()}`,
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
            }

            setTimeout(() => {
                setIsLoading(false);
                successAction();
            }, 3000);
        } catch (err) {
            setError(true);
            setIsLoading(false);
        }
    }

    // Fuzzy search stocks based on search query. Returns a list of elements representing the 5 returned stocks.
    function returnFuzzySearchData() {
        if (fuzzySearchData) {
            const searchElements: JSX.Element[] = [];

            fuzzySearchData.forEach((stock: FuzzySearchResponse) => {
                searchElements.push(
                    <div
                        key={stock.item.id}
                        onClick={() => {
                            setSelectedStockData(`${stock.item.exchange}: ${stock.item.ticker}`);
                        }}
                    >
                        <img
                            src={
                                stock.item.logos && stock.item.logos.light_symbol
                                    ? stock.item.logos.light_symbol
                                    : "https://icons.veryicon.com/png/o/business/oa-attendance-icon/company-27.png"
                            }
                            alt={`${stock.item.name} Logo`}
                        />
                        <div>
                            <p>{stock.item.name}</p>
                            <p>
                                {stock.item.exchange}: {stock.item.ticker}
                            </p>
                        </div>
                    </div>,
                );
            });

            return searchElements;
        } else {
            return;
        }
    }

    // Sanitize number input to ensure it only contains numbers and at most one decimal point.
    function sanitizeInput(
        input: string,
        stateReference: React.Dispatch<React.SetStateAction<string>>,
    ) {
        const sanitizedValue = input.replace(/[^0-9.]/g, "");

        const decimalCount = sanitizedValue.split(".").length - 1;

        if (decimalCount <= 1) {
            stateReference(sanitizedValue);
        }
    }

    return (
        <div className='add-transaction-dialog-content'>
            <h1>Add Transaction</h1>
            <div className={searchActive ? "search active" : "search"}>
                <input
                    type='text'
                    placeholder='Search Investment...'
                    value={selectedStockData ? selectedStockData : stockSearch}
                    onChange={(e) => {
                        setStockSearch(e.target.value);
                    }}
                />
                {searchActive && <div>{returnFuzzySearchData()}</div>}
            </div>
            <div className='input-fields'>
                <div>
                    <p>Market Price</p>
                    <div>
                        <span className='market-price-symbol'>$</span>
                        <input
                            type='text'
                            placeholder='0.00'
                            value={marketPrice}
                            onChange={(e) => sanitizeInput(e.target.value, setMarketPrice)}
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
                            onChange={(e) => sanitizeInput(e.target.value, setAmount)}
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

            {/* If totalPortfolioValue is not null or undefined, show total transaction value. I.e., portfolio value before and after transaction, and conditionally style/calculate based on transaction type. */}
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
