import hexRgb from "hex-rgb";
import { useEffect, useState } from "react";

import SkeletonLoading from "./SkeletonLoading";

import { Favourites } from "../types/favourites";

function Watchlist() {
    const [investments, setInvestments] = useState<Favourites>({});
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const getFavourites = async () => {
            const rawFavouritesData = await fetch(
                `${process.env.REACT_APP_SERVER_ADDRESS}users/favourites?userId=TEST-USER-ID`,
            );
            const dataJson = await rawFavouritesData.json();

            const favouritesList: Favourites = {};

            for (const stockId of dataJson) {
                const stockProfileData = await fetch(
                    `${process.env.REACT_APP_SERVER_ADDRESS}stock/getStockProfile?stockId=${stockId}`,
                );

                const stockProfileJson = await stockProfileData.json();

                const stockPerformanceData = await fetch(
                    `${process.env.REACT_APP_SERVER_ADDRESS}stock/recentPricing?stock=${stockId}`,
                );

                const stockPerformanceJson = await stockPerformanceData.json();

                favouritesList[stockId] = {
                    stockId: stockId,
                    name: stockProfileJson.name,
                    color: stockProfileJson.colors.accent || "#002945",
                    currentPrice: new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    }).format(stockPerformanceJson.latestPrice.close),
                    change: Math.round(stockPerformanceJson.dailyChange.percentage * 100) / 100,
                    companyLogo: stockProfileJson.logos.light_symbol,
                    companyWebsite: stockProfileJson.website || "#",
                };
            }

            setInvestments(favouritesList);
            setIsLoading(false);
        };

        getFavourites();
    }, []);

    function returnWatchListItems() {
        const watchListItems: JSX.Element[] = [];

        Object.values(investments).forEach((item) => {
            watchListItems.push(
                <div
                    key={item.stockId}
                    className='watchlist-item'
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
                    <i
                        className='fi fi-ss-star'
                        onClick={async () => {
                            await fetch(
                                `${process.env.REACT_APP_SERVER_ADDRESS}users/changeFavourites`,
                                {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                        userId: "TEST-USER-ID",
                                        stockId: item.stockId,
                                    }),
                                },
                            );

                            const newInvestments = { ...investments };
                            delete newInvestments[item.stockId];
                            setInvestments(newInvestments);
                        }}
                    ></i>
                    <div className='watchlist-item-inner'>
                        <span>
                            <p className='ticker'>{item.stockId.replace("_", ": ")}</p>
                            <p className='name'>{item.name}</p>
                        </span>
                        <span>
                            <p className='current-price'>{item.currentPrice}</p>
                            <p className='change'>
                                {item.change !== 0 ? (
                                    item.change > 0 ? (
                                        <i className='fi fi-ss-arrow-trend-up'></i>
                                    ) : (
                                        <i className='fi fi-ss-arrow-trend-down'></i>
                                    )
                                ) : (
                                    <i className='fi fi-ss-horizontal-rule'></i>
                                )}
                                {Math.abs(item.change)}%
                            </p>
                        </span>
                    </div>
                    <a
                        title='Visit Company Website'
                        href={item.companyWebsite}
                        target='_blank'
                        rel='noreferrer'
                    >
                        <div className='company-logo'>
                            <img
                                src={
                                    item.companyLogo ||
                                    "https://icons.veryicon.com/png/o/business/oa-attendance-icon/company-27.png"
                                }
                                alt={item.name + " Logo"}
                                className={!item.companyLogo ? "logo-white" : ""}
                            />
                        </div>
                    </a>
                </div>,
            );
        });

        return watchListItems;
    }

    return (
        <div className='watchlist-container'>
            {!isLoading ? (
                Object.keys(investments).length === 0 ? (
                    <div className='no-watchlist-item'>
                        <i className='fi fi-rr-eye'></i>
                        <h3>Watchlist Empty</h3>
                    </div>
                ) : (
                    returnWatchListItems()
                )
            ) : (
                <SkeletonLoading skeletonStyle={undefined} />
            )}
        </div>
    );
}

export default Watchlist;
