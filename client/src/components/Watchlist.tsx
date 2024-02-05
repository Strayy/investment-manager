import hexRgb from 'hex-rgb';
import { useEffect, useState } from 'react';

function Watchlist() {
    const [investments, setInvestments] = useState<
        {
            ticker: string;
            name: string;
            color: string;
            currentPrice: string;
            change: GLfloat;
            companyLogo: string;
            companyWebsite: string;
        }[]
    >([
        {
            ticker: "TSLA",
            name: "Tesla",
            color: "#cc0000",
            currentPrice: "$185.90",
            change: 2.97,
            companyLogo:
                "https://asset.brandfetch.io/id2S-kXbuK/iduZOzPw94.png",
            companyWebsite: "https://tesla.com/",
        },
        {
            ticker: "MSFT",
            name: "Microsoft",
            color: "#0067b8",
            currentPrice: "$289.84",
            change: 2.24,
            companyLogo:
                "https://asset.brandfetch.io/idchmboHEZ/id0K98Gag1.png",
            companyWebsite: "https://microsoft.com/",
        },
        {
            ticker: "AAPL",
            name: "Apple",
            color: "#0066CC",
            currentPrice: "$165.56",
            change: 3.41,
            companyLogo:
                "https://asset.brandfetch.io/idnrCPuv87/id3SVF6ez4.png",
            companyWebsite: "https://apple.com/",
        },
    ]);

    // useEffect(() => {
    //     investments.forEach(async (item) => {
    //         await fetch(`https://api.polygon.io/v2/aggs/ticker/${item.ticker}/prev?adjusted=true&apiKey=g2KWbQclgLr8UP1sUBN4gk3Ml4ciO32I`, {
    //             method: 'GET'
    //         })
    //         .then((response) => response.json())
    //         .then((data) => {
    //             let investmentsArray = investments.splice(investments.indexOf(item), 1);

    //             // setInvestments(...investments, )
    //             item.currentPrice = data.results.c;
    //             item.change = (data.results.c - data.results.o) / data.results.o * 100;

    //         })
    //     });
    // }, []);

    function returnWatchListItems() {
        let watchListItems: JSX.Element[] = [];

        investments.forEach((item) => {
            watchListItems.push(
                <div
                    key={item.ticker}
                    className="watchlist-item"
                    style={{
                        backgroundImage: `linear-gradient(to top right, rgba(
                            ${hexRgb(item.color).red - 100},
                            ${hexRgb(item.color).green - 100},
                            ${hexRgb(item.color).blue - 100}
                        ),
                        ${item.color}
                    )`,
                        border: `2px solid ${item.color}`,
                    }}
                >
                    <i className="fi fi-ss-star"></i>
                    <div className="watchlist-item-inner">
                        <span>
                            <p className="ticker">{item.ticker}</p>
                            <p className="name">{item.name}</p>
                        </span>
                        <span>
                            <p className="current-price">{item.currentPrice}</p>
                            <p className="change">
                                {item.change !== 0 ? (
                                    item.change > 0 ? (
                                        <i className="fi fi-ss-arrow-trend-up"></i>
                                    ) : (
                                        <i className="fi fi-ss-arrow-trend-down"></i>
                                    )
                                ) : (
                                    <i className="fi fi-ss-horizontal-rule"></i>
                                )}
                                {Math.abs(item.change)}%
                            </p>
                        </span>
                    </div>
                    <a
                        title="Visit Company Website"
                        href={item.companyWebsite}
                        target="_blank"
                        rel="noreferrer"
                    >
                        <div className="company-logo">
                            <img
                                src={item.companyLogo}
                                alt={item.name + " Logo"}
                            />
                        </div>
                    </a>
                </div>
            );
        });

        return watchListItems;
    }

    return (
        <div className="watchlist-container">
            {investments.length === 0 ? (
                <div className="no-watchlist-item">
                    <p>Add Watchlist Item</p>
                </div>
            ) : (
                returnWatchListItems()
            )}
        </div>
    );
}

export default Watchlist;
