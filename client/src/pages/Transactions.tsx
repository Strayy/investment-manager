import { useEffect, useState } from "react";

import Table from "../components/Table";
import { ITableData } from "../types/tableData";

function Transactions() {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [transactionData, setTransactionData] = useState<(string | number)[][]>([]);
    const [tableData, setTableData] = useState<ITableData | null>(null);

    useEffect(() => {
        async function getTrades() {
            // Returns list of trades made by user
            // TODO Integrate userId functionality
            const rawTradesData = await fetch(
                `${process.env.REACT_APP_SERVER_ADDRESS}/portfolio/getTrades?userId=TEST-USER-ID`,
            );
            const dataJson = await rawTradesData.json();

            // String containing array of arrays representing table data
            const transactionData: (string | number)[][] = [];

            // Object containing most recent adjClose values for stockIds
            const adjCloseReturned: { [key: string]: number } = {};

            // Loop through user's transactions
            for (const transaction of dataJson) {
                const [exchange, ticker] = transaction.stockId.split("_");

                // If recent adjClose price of stock has not been returned, query API and add to adjCloseReturned
                if (!Object.keys(adjCloseReturned).includes(transaction.stockId)) {
                    const pricingData = await fetch(
                        `${process.env.REACT_APP_SERVER_ADDRESS}stock/recentPricing?stock=${transaction.stockId}`,
                    );

                    const pricingDataJson = await pricingData.json();

                    adjCloseReturned[transaction.stockId] = pricingDataJson.latestPrice.adjClose;
                }

                // Add array of table data values to transactionData
                transactionData.push([
                    `${exchange}: ${ticker}`,
                    transaction.action,
                    Math.round(transaction.amount * 100) / 100,
                    transaction.price.toFixed(2),
                    (transaction.amount * transaction.price).toFixed(2),
                    adjCloseReturned[transaction.stockId].toFixed(2),
                    (
                        ((adjCloseReturned[transaction.stockId] - transaction.price) /
                            adjCloseReturned[transaction.stockId]) *
                        100
                    ).toFixed(2), // Convert to % change
                    new Date(transaction.date).toLocaleDateString("en-GB"),
                ]);
            }

            setTransactionData(transactionData);
            setIsLoading(false);
        }

        getTrades();
    }, []);

    useEffect(() => {
        setTableData({
            headings: [
                "Item",
                "Action",
                "Quantity",
                "Purchase Price",
                "Total Price",
                "Current Price",
                "Change",
                "Date",
            ],
            sections: {
                transactions: {
                    data: transactionData,
                },
            },
            settings: {
                collapsable: false,
                sortable: false,
                multiSelect: false,
                multiSelectSection: false,
                lazyLoad: true,
                lockSectionHeadingOnScroll: true,
                sortBySection: false,
                filterBySection: false,
                styleColumnsByValue: [[0], [1], [6]],
                columnStyling: [
                    ["bold", "alignLeft"],
                    ["styleBuySell"],
                    ["color", "percentage", "iconsFront", "stripNegativeSign"],
                ],
                defaultSortOrder: "desc",
                defaultSortIndex: 7,
            },
        });
    }, [transactionData]);

    return (
        <div className='transactions'>
            <div className='transactions-title'>
                <h1>Transactions</h1>
            </div>
            <div className='table'>
                <Table data={tableData} isLoading={isLoading} />
            </div>
        </div>
    );
}

export default Transactions;
