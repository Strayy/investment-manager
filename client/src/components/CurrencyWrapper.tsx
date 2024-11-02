import { useContext, useEffect, useState } from "react";

import { currencies } from "../constants/currencies.ts";
import { Context } from "../App.tsx";

function CurrencyWrapper({
    currency,
    data,
    className,
}: {
    currency: string;
    data: string | number;
    className?: string;
}) {
    const [selectedCurrency] = useContext(Context).currency;

    const [convertedCurrency, setConvertedCurrency] = useState<number>();

    useEffect(() => {
        async function fetchConversionRate() {
            const conversionRateJson = await fetch(
                `${process.env.REACT_APP_SERVER_ADDRESS}currency/rate?from=${currency}&to=${selectedCurrency}`,
            );
            const conversionRateData = await conversionRateJson.json();

            setConvertedCurrency(conversionRateData * Number(data));
        }

        fetchConversionRate();
    }, [selectedCurrency]);

    function formatCurrency() {
        return `${Object.keys(currencies).includes(selectedCurrency) ? currencies[selectedCurrency].symbol : "$"}${Math.round(Number(convertedCurrency) * 100) / 100}`;
    }

    return <p className={className}>{formatCurrency()}</p>;
}

export default CurrencyWrapper;
