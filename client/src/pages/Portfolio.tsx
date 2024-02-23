import { useEffect, useState } from "react";

import Graph from "../components/Graph";
import Table from "../components/Table";
import Dialog from "../components/Dialog";
import AddTransaction from "../components/AddTransaction";
import { ITableData, Section } from "../types/tableData";

function Portfolio() {
    const [portfolioData, setPortfolioData] = useState<{ [key: string]: Section } | undefined>(
        undefined,
    );
    const [tableData, setTableData] = useState<ITableData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [showDialog, setShowDialog] = useState<boolean>(false);

    // Transaction mode state for add transaction dialog. True = buy, False = sell. Defaults to Buy for when clicking button from sidebar.
    const [transactionMode, setTransactionMode] = useState<boolean>(true);

    // Returns and formats data to be passed to Table component upon page load
    useEffect(() => {
        async function getPortfolioData() {
            // Returns list of portfolio holdings for userId
            // TODO Integrate userId functionality
            const rawPortfolioData = await fetch(
                `${process.env.REACT_APP_SERVER_ADDRESS}portfolio/getHoldings?userId=TEST-USER-ID`,
            );
            const dataJson = await rawPortfolioData.json();

            const portfolioData: { [key: string]: Section } = {};

            // Loops through each stock in portfolio
            for (const [stockKey, stockData] of Object.entries(dataJson.holdings) as [
                string,
                { amount: number; averageBuyPrice: number; percentage: number },
            ][]) {
                const [exchange, ticker] = stockKey.split("_");

                // Returns current pricing of stock
                const pricingData = await fetch(
                    `${process.env.REACT_APP_SERVER_ADDRESS}stock/recentPricing?stock=${stockKey}`,
                );

                const pricingDataJson = await pricingData.json();

                // Returns the most recent transaction for a given stock
                const latestTransactionData = await fetch(
                    `${process.env.REACT_APP_SERVER_ADDRESS}portfolio/getMostRecentTransaction?userId=TEST-USER-ID&stockId=${stockKey}`,
                );

                const latestTransactionJson = await latestTransactionData.json();

                // Formats data to be added to portfolioData
                portfolioData[exchange] = {
                    data: [
                        [
                            ticker === "RAT" ? "🐀" : ticker,
                            stockData["amount"],
                            Math.round(pricingDataJson["latestPrice"]["adjClose"] * 100) / 100,
                            Math.round(pricingDataJson["dailyChange"]["percentage"] * 100) / 100,
                            Math.round(pricingDataJson["ytd"]["percentage"] * 100) / 100,
                            stockData["averageBuyPrice"],
                            Math.round(stockData["percentage"] * 10) / 10,
                            new Date(latestTransactionJson[stockKey].date).toLocaleDateString(
                                "en-GB",
                            ),
                        ],
                    ],
                };
            }

            setPortfolioData(portfolioData);
            setIsLoading(false);
        }

        getPortfolioData();
    }, []);

    // Updates tableData state when portfolioData is changed.
    useEffect(() => {
        setTableData({
            headings: [
                "Item",
                "Quantity",
                "Price",
                "Daily Change",
                "YTD",
                "Average Buy Price",
                "Portfolio",
                "Last Transaction",
            ],
            sections: portfolioData,
            settings: {
                collapsable: false,
                sortable: false,
                multiSelect: false,
                multiSelectSection: false,
                lazyLoad: false,
                lockSectionHeadingOnScroll: false,
                sortBySection: false,
                filterBySection: false,
                styleColumnsByValue: [[0], [3, 4], [6]],
                columnStyling: [
                    ["bold", "alignLeft"],
                    ["color", "percentage", "iconsFront", "stripNegativeSign"],
                    ["percentage"],
                ],
            },
        });
    }, [portfolioData]);

    return (
        <div className='portfolio'>
            {showDialog && (
                <Dialog
                    dialogContent={<AddTransaction transactionMode={transactionMode} />}
                    closeAction={setShowDialog}
                />
            )}
            <div className='portfolio-title'>
                <h1>Portfolio</h1>
                <div>
                    <div
                        onClick={() => {
                            setShowDialog(true);
                            setTransactionMode(true);
                        }}
                    >
                        Buy
                    </div>
                    <div
                        onClick={() => {
                            setShowDialog(true);
                            setTransactionMode(false);
                        }}
                    >
                        Sell
                    </div>
                </div>
            </div>
            <div className='portfolio-elements'>
                <div className='table'>
                    <Table data={tableData} isLoading={isLoading} />
                </div>
                <div className='graph'>{/* <Graph /> */}</div>
            </div>
        </div>
    );
}

export default Portfolio;
