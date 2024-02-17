import { useEffect, useState } from "react";

import Graph from "../components/Graph";
import Table from "../components/Table";

import ITableData from "../types/tableData";

function Portfolio() {
    const [portfolioData, updatePortfolioData] = useState<any>(null);
    const [tableData, updateTableData] = useState<any>(null);

    useEffect(() => {
        async function getPortfolioData() {
            const rawPortfolioData = await fetch(
                `${process.env.REACT_APP_SERVER_ADDRESS}portfolio/getHoldings?userId=TEST-USER-ID`
            );
            const dataJson = await rawPortfolioData.json();

            let portfolioData: any = {};

            for (const [stockKey, stockData] of Object.entries(
                dataJson.holdings
            ) as [string, any]) {
                const [exchange, ticker] = stockKey.split("_");

                const pricingData = await fetch(
                    `${process.env.REACT_APP_SERVER_ADDRESS}stock/recentPricing?stock=${stockKey}`
                );

                const pricingDataJson = await pricingData.json();

                const latestTransactionData = await fetch(
                    `${process.env.REACT_APP_SERVER_ADDRESS}portfolio/getMostRecentTransaction?userId=TEST-USER-ID&stockId=${stockKey}`
                );

                const latestTransactionJson =
                    await latestTransactionData.json();

                portfolioData[exchange] = {
                    data: [
                        [
                            ticker,
                            stockData["amount"],
                            pricingDataJson["latestPrice"]["adjClose"],
                            `${
                                Math.round(
                                    pricingDataJson["dailyChange"][
                                        "percentage"
                                    ] * 100
                                ) / 100
                            }%`,
                            `${
                                Math.round(
                                    pricingDataJson["ytd"]["percentage"] * 100
                                ) / 100
                            }%`,
                            stockData["averageBuyPrice"],
                            `${Math.round(stockData["percentage"] * 10) / 10}%`,
                            latestTransactionJson[stockKey].date.split("T")[0],
                        ],
                    ],
                };
            }

            updatePortfolioData(portfolioData);
        }

        getPortfolioData();
    }, []);

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
                boldDataColumns: [0],
            },
        });
    }, [portfolioData]);

    return (
        <div className="portfolio">
            <div className="portfolio-title">
                <h1>Portfolio</h1>
                <div>
                    <div>Buy</div>
                    <div>Sell</div>
                </div>
            </div>
            <div className="portfolio-elements">
                <Table data={tableData} />
                <div className="graph">
                    <Graph />
                </div>
            </div>
        </div>
    );
}

export default Portfolio;
