import { Link } from "react-router-dom";

function Header() {
    return (
        <div className='header-container'>
            <span>
                <Link to='/'>
                    <p>Investment Management Dashboard</p>
                </Link>
            </span>
            <span>
                <select>
                    <option>USD $</option>
                    <option>EUR €</option>
                    <option>JPY ¥</option>
                    <option>GBP £</option>
                    <option>CNY ¥</option>
                    <option>AUD $</option>
                    <option>CAD $</option>
                    <option>CHF Fr.</option>
                    <option>HKD $</option>
                    <option>SGD $</option>
                    <option>SEK kr</option>
                    <option>KRW ₩</option>
                    <option>NOK kr</option>
                    <option>NZD $</option>
                    <option>INR ₹</option>
                </select>
                <input type='text' placeholder='Search...' />
            </span>
        </div>
    );
}

export default Header;
