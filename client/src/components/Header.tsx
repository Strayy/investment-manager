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
                </select>
                <input type='text' placeholder='Search...' />
            </span>
        </div>
    );
}

export default Header;
