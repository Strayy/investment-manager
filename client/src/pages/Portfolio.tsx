import { useEffect, useState } from "react";

import Graph from "../components/Graph";
import Table from "../components/Table";

import { ITableData } from "../types/tableData";

function Portfolio() {
    const [portfolioData, updatePortfolioData] = useState<any>(null);
    const [tableData, updateTableData] = useState<ITableData | null>(null);
    const [isLoading, updateIsLoading] = useState<boolean>(true);

    // Returns and formats data to be passed to Table component upon page load
    useEffect(() => {
        async function getPortfolioData() {
            // Returns list of portfolio holdings for userId
            // TODO Integrate userId functionality
            const rawPortfolioData = await fetch(
                `${process.env.REACT_APP_SERVER_ADDRESS}portfolio/getHoldings?userId=TEST-USER-ID`,
            );
            const dataJson = await rawPortfolioData.json();

            let portfolioData: any = {};

            // Loops through each stock in portfolio
            for (const [stockKey, stockData] of Object.entries(dataJson.holdings) as [
                string,
                any,
            ]) {
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
                            ticker,
                            stockData["amount"],
                            pricingDataJson["latestPrice"]["adjClose"],
                            Math.round(pricingDataJson["dailyChange"]["percentage"] * 100) / 100,
                            Math.round(pricingDataJson["ytd"]["percentage"] * 100) / 100,
                            stockData["averageBuyPrice"],
                            Math.round(stockData["percentage"] * 10) / 10,
                            latestTransactionJson[stockKey].date.split("T")[0],
                        ],
                    ],
                };
            }

            updatePortfolioData(portfolioData);
            updateIsLoading(false);
        }

        getPortfolioData();
    }, []);

    // Updates tableData state when portfolioData is changed.
    useEffect(() => {
        updateTableData({
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
            <div className='portfolio-title'>
                <h1>Portfolio</h1>
                <div>
                    <div>Buy</div>
                    <div>Sell</div>
                </div>
            </div>
            <div className='portfolio-elements'>
                <div className='table'>
                    <Table data={tableData} isLoading={isLoading} />
                </div>
                <div className='graph'>
                    <Graph />
                </div>
            </div>
        </div>
    );
}

export default Portfolio;
