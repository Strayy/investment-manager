import { useContext, useEffect, useState } from "react";

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
    const [selectedCurrency] = useContext(Context).selectedCurrency;
    const [currencyRates] = useContext(Context).currencyRates;

    const [convertedCurrency, setConvertedCurrency] = useState<number>();

    useEffect(() => {
        async function fetchConversionRate() {
            const conversionRateJson = await fetch(
                `${process.env.REACT_APP_SERVER_ADDRESS}currency/rate?from=${currency}&to=${selectedCurrency}`,
            );
            const conversionRateData = await conversionRateJson.json();

            setConvertedCurrency(conversionRateData.rate * Number(data));
        }

        if (currencyRates !== null && currencyRates[selectedCurrency]) {
            setConvertedCurrency(Number(currencyRates[selectedCurrency].rate) * Number(data));
        } else {
            fetchConversionRate();
        }
    }, [selectedCurrency]);

    return (
        <p className={className}>
            {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: selectedCurrency,
            }).format(Number(convertedCurrency))}
        </p>
    );
}

export default CurrencyWrapper;
