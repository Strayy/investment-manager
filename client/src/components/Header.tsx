import { useContext } from "react";

import { Context } from "../App";
import { currencies } from "../constants/currencies";

function Header() {
    const [selectedCurrency, setSelectedCurrency] = useContext(Context).currency;

    function changeCurrency(currency: string) {
        setSelectedCurrency(currency);
    }

    function currencyGenerator() {
        const currencyOptions: any[] = [];

        Object.entries(currencies).forEach((currency) => {
            currencyOptions.push(
                <option
                    key={currency[0]}
                    value={currency[0]}
                >{`${currency[0]} ${currency[1].symbol}`}</option>,
            );
        });

        return currencyOptions;
    }

    return (
        <div className='header-container'>
            <span>
                <input type='text' placeholder='Search...' />
            </span>
            <span>
                <select onChange={(e) => changeCurrency(e.target.value)} defaultValue={"USD"}>
                    {currencyGenerator()}
                </select>
                <div className='notifications'>
                    {Math.random() < 0.5 ? (
                        <>
                            <div className='notifications-circle'></div>
                            <i className='fi fi-ss-bell'></i>
                        </>
                    ) : (
                        <>
                            <i className='fi fi-rr-bell'></i>
                        </>
                    )}
                </div>
                <div
                    className='profile-picture'
                    style={{
                        backgroundImage: `url("https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2")`,
                    }}
                ></div>
            </span>
        </div>
    );
}

export default Header;
