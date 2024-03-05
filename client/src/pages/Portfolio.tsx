import { useEffect, useState } from "react";

import Graph from "../components/Graph";
import Table from "../components/Table";
import Dialog from "../components/Dialog";
import AddTransaction from "../components/AddTransaction";
import { ITableData, Section } from "../types/tableData";
import { useParams, useNavigate } from "react-router-dom";

function Portfolio() {
    const { param } = useParams();
    const navigate = useNavigate();

    const [portfolioData, setPortfolioData] = useState<{ [key: string]: Section } | undefined>(
        undefined,
    );
    const [tableData, setTableData] = useState<ITableData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [showDialog, setShowDialog] = useState<boolean>(false);
    const [totalPortfolioValue, setTotalPortfolioValue] = useState<number | null>(null);

    // Check link to see if it has the buy param. I.e., /portfolio/buy. If true, open the add transaction dialog. If /portfolio only, do nothing. If /portfolio/anything_else, redirect to the dashboard.
    useEffect(() => {
        if (param === "buy") {
            setShowDialog(true);
        } else if (param !== undefined) {
            navigate("/");
        }
    }, [param]);

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

            setTotalPortfolioValue(dataJson.portfolio.totalValue);

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

                // Create portfolioData section for the exchange if it doesn't exist, and populate with empty data array.
                portfolioData[exchange] ??= { data: [] };

                // Formats data to be added to portfolioData
                portfolioData[exchange]["data"].push([
                    ticker,
                    stockData["amount"],
                    Math.round(pricingDataJson["latestPrice"]["adjClose"] * 100) / 100,
                    Math.round(pricingDataJson["dailyChange"]["percentage"] * 100) / 100,
                    Math.round(pricingDataJson["ytd"]["percentage"] * 100) / 100,
                    stockData["averageBuyPrice"],
                    Math.round(stockData["percentage"] * 10) / 10,
                    new Date(latestTransactionJson[stockKey].date).toLocaleDateString("en-GB"),
                ]);

                portfolioData[exchange]["heading"] = exchange;
                portfolioData[exchange]["importance"] = 1;
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
                lazyLoad: true,
                lockSectionHeadingOnScroll: true,
                sortBySection: false,
                filterBySection: false,
                styleColumnsByValue: [[0], [3, 4], [6]],
                columnStyling: [
                    ["bold", "alignLeft"],
                    ["color", "percentage", "iconsFront", "stripNegativeSign"],
                    ["percentage"],
                ],
                defaultSortOrder: "desc",
                defaultSortIndex: 6,
            },
        });
    }, [portfolioData]);

    function closeDialog() {
        navigate("/portfolio");
        setShowDialog(false);
    }

    return (
        <div className='portfolio'>
            {showDialog && (
                <Dialog
                    dialogContent={
                        <AddTransaction
                            transactionMode={transactionMode}
                            successAction={() => closeDialog()}
                            totalPortfolioValue={totalPortfolioValue}
                        />
                    }
                    closeAction={() => closeDialog()}
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
