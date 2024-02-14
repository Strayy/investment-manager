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

            Object.entries(dataJson).forEach((stock: any) => {
                const [exchange, ticker] = stock[0].split("_");

                portfolioData[exchange] = {
                    data: [
                        [
                            ticker,
                            stock[1]["amount"],
                            "Price",
                            "Daily Change",
                            "YTD",
                            stock[1]["averageBuyPrice"],
                            "Portfolio",
                            "Last Transaction",
                        ],
                    ],
                };
            });

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
                boldDataColumns: [1],
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
