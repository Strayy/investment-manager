import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, createContext, useEffect } from "react";

import { IToastMessage } from "./types/toastMessage";
import { ICurrencyExchange } from "./types/currency";

import "./styles/styles.scss";
import { currencies } from "./constants/currencies.ts";

import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Portfolio from "./pages/Portfolio";
import Transactions from "./pages/Transactions";

export const Context = createContext<{
    toastMessages: [IToastMessage[], any];
    selectedCurrency: [string, any];
    currencyRates: [ICurrencyExchange | null, any];
}>({
    toastMessages: [[], () => null],
    selectedCurrency: ["USD", () => null],
    currencyRates: [{}, () => null],
});

function App() {
    const [toastMessages, setToastMessages] = useState([]);
    const [selectedCurrency, setSelectedCurrency] = useState("USD");
    const [currencyRates, setCurrencyRates] = useState<ICurrencyExchange | null>(null);

    useEffect(() => {
        async function fetchConversionRate(currency: string) {
            console.log("fetch Conversion Rate");

            const conversionRateJson = await fetch(
                `${process.env.REACT_APP_SERVER_ADDRESS}currency/rate?from=USD&to=${currency}`,
            );
            const conversionRateData = await conversionRateJson.json();

            setCurrencyRates((prevState) => ({
                ...prevState,
                [currency]: {
                    date: conversionRateData.date,
                    rate: conversionRateData.rate,
                },
            }));
        }

        Object.keys(currencies).forEach(async (currency) => {
            await fetchConversionRate(currency);
        });
    }, []);

    return (
        <Context.Provider
            value={{
                toastMessages: [toastMessages, setToastMessages],
                selectedCurrency: [selectedCurrency, setSelectedCurrency],
                currencyRates: [currencyRates, setCurrencyRates],
            }}
        >
            <BrowserRouter>
                <Routes>
                    <Route path='/' element={<Layout />}>
                        <Route index element={<Dashboard />} />
                        <Route path='/portfolio/:param?' element={<Portfolio />} />
                        <Route path='/transactions' element={<Transactions />} />
                        <Route path='*' element={<Dashboard />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </Context.Provider>
    );
}

export default App;
