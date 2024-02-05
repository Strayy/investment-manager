import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import hexRgb from 'hex-rgb';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    Legend,
    Tooltip,
    LineElement
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    Legend,
    Tooltip,
    LineElement
);

function Graph() {
    const tickers = ['TSLA', 'AAPL', 'MSFT'];

    const [stockPriceData, setStockPriceData] = useState<{
        [key: string]: [{
            [key: string]: string
        }]
    }>({});
    const [graphComponentDates, setGraphComponentDates] = useState<string[]>([]);
    const [graphComponentData, setGraphComponentData] = useState<any>();
    const [companyData, setCompanyData] = useState<any>();

    useEffect(() => {
        async function fetchStockData() {
            const responses = await Promise.all(
                tickers.map((ticker) =>
                    fetch(`http://localhost:5000/api/getData/${ticker}`)
                )
            );

            responses.map(async (response) => {
                const singleTickerData = await response.json();
                const ticker = response.url.split("/").slice(-1);

                setStockPriceData((stockPriceData) => {
                    const newDataWithKey = { [ticker[0]]: singleTickerData };
                    return { ...stockPriceData, ...newDataWithKey };
                });
            });
        }

        async function fetchCompanyData() {
            const companyData = await fetch(
                "http://localhost:5000/api/getCompanyData/"
            )
                .then((res) => res.json())
                .then((data) => {
                    return data;
                });

            setCompanyData(companyData);
        }

        fetchCompanyData();
        fetchStockData();
    }, []);

    useEffect(() => {
        let dateList: string[] = [];
        let datasetsList: {}[] = [];

        Promise.all(
            tickers.map(async (ticker) => {
                if (
                    Object.keys(stockPriceData).length !== 0 &&
                    Object.keys(companyData).length !== 0
                ) {
                    const data = stockPriceData[ticker];

                    const dateEntries = await data.map((entry) => {
                        return entry.Date;
                    });
                    dateList.push(...dateEntries);

                    const datasetEntries = await data.map((entry) => {
                        return entry.Close;
                    });

                    const stockColor = hexRgb(companyData[ticker].color);

                    datasetsList.push({
                        label: ticker,
                        data: datasetEntries,
                        borderColor: `rgb(${stockColor.red}, ${stockColor.green}, ${stockColor.blue})`,
                        backgroundColor: `rgba(${stockColor.red}, ${stockColor.green}, ${stockColor.blue}, 0.5)`,
                        tension: 0.25,
                    });
                }
            })
        ).then(() => {
            setGraphComponentDates([...new Set(dateList)]);
            setGraphComponentData(datasetsList);
        });
    }, [stockPriceData, companyData]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const
            },
        },
        scales: {
            x: {
                ticks: {
                    color: 'rgba(255, 255, 255, 0.5)'
                }
            },
            y: {
                ticks: {
                    color: 'rgba(255, 255, 255, 0.5)'
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.25)'
                }
            }
        },
        pointRadius: 1,
    };

    return (
        <Line options={options} data={{
            labels: graphComponentDates,
            datasets: graphComponentData || []
        }} />
    );
}

export default Graph;